# Autenticación del Admin Panel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Proteger `/admin/*` con Supabase Auth (sesión por cookie), altas de usuario por invitación (correo → set de contraseña → logueado), y cerrar la base con RLS.

**Architecture:** Autenticación basada en cookies con `@supabase/ssr` sobre Next.js 14 App Router. Un middleware protege `/admin/*`; un route handler de callback canjea el enlace del correo por sesión; RLS en `products`/`content_plan` restringe escrituras a usuarios autenticados. Supabase envía los correos vía Resend (SMTP).

**Tech Stack:** Next.js 14.2.23, React 18, `@supabase/ssr`, `@supabase/supabase-js`, Supabase (Postgres + Auth + Storage), Resend (SMTP), Node 22.x.

## Global Constraints

- Next.js **14.2.23** App Router; Node **22.x** (`cookies()` de `next/headers` es síncrono en 14).
- Todo lo que dependa de sesión usa **`@supabase/ssr`** (ya instalado). Nunca exponer `SUPABASE_SERVICE_ROLE_KEY` al navegador — solo servidor/scripts.
- Remitente de correos: **`noreply@send.bralto.io`** vía Resend SMTP. Dominio de producción: **`https://aoliquidationwarehouse.com`**.
- **Invitación-solo**: registro público desactivado; cualquier usuario autenticado = admin total.
- Marca: navy `#0F233F` / `#0A1829`, rojo `#E11D27`, tipografía Inter (ver `src/app/Brand-AOLW/page.tsx`).
- Los scripts se corren con `node --env-file=.env.local <script>` (env-file nativo de Node 22).
- **Enfoque de verificación:** el repo no tiene harness de tests unitarios y agregar uno para UI de auth queda fuera de alcance. El gate automatizado es `npm run build` (typecheck de Next) + el script `scripts/verify-rls.mjs` (chequeo real de RLS). El resto se valida con E2E manual documentado (Task 11).
- Rama de trabajo: `feat/admin-auth`.

---

## File Structure

**Nuevos:**
- `src/lib/supabase/client.ts` — cliente de navegador con sesión (singleton).
- `src/lib/supabase/server.ts` — cliente de servidor (route handlers / server components).
- `src/lib/supabase/middleware.ts` — helper `updateSession` (refresco + guard).
- `middleware.ts` (raíz) — matcher `/admin/:path*`.
- `src/app/admin/login/page.tsx` — login + "¿Olvidaste tu contraseña?".
- `src/app/admin/set-password/page.tsx` — crear/confirmar contraseña.
- `src/app/admin/auth/callback/route.ts` — canje de código/token por sesión.
- `src/app/admin/auth/signout/route.ts` — cerrar sesión.
- `supabase/migrations/20260702000001_admin_auth_rls.sql` — RLS.
- `scripts/invite-user.mjs` — invitar usuarios (service-role).
- `scripts/verify-rls.mjs` — verificación de RLS (anon).
- `docs/superpowers/checklists/admin-auth-setup.md` — checklist de configuración (Supabase/Resend/Vercel).

**Modificados:**
- `src/app/admin/layout.tsx` — barra superior con email + logout (pasa a server component).
- `src/lib/products.ts` — funciones de escritura usan el cliente con sesión.
- `src/lib/content.ts` — todas las funciones usan el cliente con sesión (admin-only).
- `src/lib/supabase.ts` — `uploadProductImage`/`deleteProductImage` usan el cliente con sesión.
- `.env.local` — agregar `NEXT_PUBLIC_SITE_URL`.

---

## Task 1: Clientes Supabase SSR + variable de entorno

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Modify: `.env.local`

**Interfaces:**
- Produces: `createClient()` (de `client.ts`) → cliente de navegador con sesión; `createClient()` (de `server.ts`) → cliente de servidor. Ambos leen `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

- [ ] **Step 1: Agregar la variable de entorno**

En `.env.local` agregar (sin comillas):
```
NEXT_PUBLIC_SITE_URL=https://aoliquidationwarehouse.com
```

- [ ] **Step 2: Crear el cliente de navegador**

`src/lib/supabase/client.ts`:
```ts
import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

/** Cliente de Supabase para el navegador. Lleva la sesión del usuario (cookies). */
export function createClient() {
  if (browserClient) return browserClient;
  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return browserClient;
}
```

- [ ] **Step 3: Crear el cliente de servidor**

`src/lib/supabase/server.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Cliente de Supabase para servidor (route handlers / server components). */
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Llamado desde un Server Component: ignorar (el middleware refresca la sesión).
          }
        },
      },
    },
  );
}
```

- [ ] **Step 4: Verificar typecheck**

Run: `npm run build`
Expected: build PASA (sin errores de tipos en los dos archivos nuevos). Si falla por otra razón preexistente, confirmar que no menciona `src/lib/supabase/*`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/client.ts src/lib/supabase/server.ts .env.local
git commit -m "feat(auth): clientes Supabase SSR (browser + server) y NEXT_PUBLIC_SITE_URL"
```

---

## Task 2: Middleware de protección de `/admin/*`

**Files:**
- Create: `src/lib/supabase/middleware.ts`
- Create: `middleware.ts`

**Interfaces:**
- Consumes: `createServerClient` de `@supabase/ssr`.
- Produces: `updateSession(request)` → `NextResponse`. `middleware.ts` exporta `middleware` y `config.matcher`.

Reglas: rutas que empiezan con `/admin/login` o `/admin/auth` son públicas; el resto de `/admin/*` exige sesión. Con sesión + visitando login → redirige a `/admin`.

- [ ] **Step 1: Crear el helper `updateSession`**

`src/lib/supabase/middleware.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: no metas lógica entre createServerClient y getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic =
    path.startsWith("/admin/login") || path.startsWith("/admin/auth");

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (user && path.startsWith("/admin/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

- [ ] **Step 2: Crear el middleware raíz**

`middleware.ts` (en la raíz del repo):
```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 3: Verificar typecheck**

Run: `npm run build`
Expected: PASA.

- [ ] **Step 4: Verificación funcional (dev)**

Run: `npm run dev`, luego en el navegador ir a `http://localhost:3000/admin/productos`.
Expected: redirige a `http://localhost:3000/admin/login` (todavía sin página → 404 de Next en `/admin/login`, PERO la URL debe cambiar a `/admin/login`). Eso confirma que el guard funciona.

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/middleware.ts middleware.ts
git commit -m "feat(auth): middleware que protege /admin/*"
```

---

## Task 3: Route handler de callback

**Files:**
- Create: `src/app/admin/auth/callback/route.ts`

**Interfaces:**
- Consumes: `createClient` de `@/lib/supabase/server`.
- Produces: `GET` que canjea `?code=` (PKCE) o `?token_hash=&type=` (OTP) y redirige a `?next` (default `/admin`).

- [ ] **Step 1: Crear el route handler**

`src/app/admin/auth/callback/route.ts`:
```ts
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const rawNext = searchParams.get("next") ?? "/admin";
  // Evita open-redirect: solo rutas internas ("/algo", nunca "//externo").
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/admin";

  const supabase = createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }

  return NextResponse.redirect(new URL("/admin/login?error=enlace", origin));
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `npm run build`
Expected: PASA.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/auth/callback/route.ts
git commit -m "feat(auth): callback que canjea el enlace del correo por sesión"
```

---

## Task 4: Cerrar sesión + barra del admin

**Files:**
- Create: `src/app/admin/auth/signout/route.ts`
- Modify: `src/app/admin/layout.tsx`

**Interfaces:**
- Consumes: `createClient` de `@/lib/supabase/server`.
- Produces: `POST /admin/auth/signout` (cierra sesión, redirige a login). Layout muestra `user.email` + botón logout cuando hay sesión.

- [ ] **Step 1: Crear el route de signout**

`src/app/admin/auth/signout/route.ts`:
```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/admin/login", request.url), {
    status: 303,
  });
}
```

- [ ] **Step 2: Convertir el layout en server component con barra**

`src/app/admin/layout.tsx` (reemplazar todo el contenido):
```tsx
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {user && (
        <header className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] bg-white px-6 py-3">
          <span className="text-sm font-semibold text-[#0F233F]">
            AO Liquidation Warehouse · Admin
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#6B7280]">{user.email}</span>
            <form action="/admin/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-lg bg-[#0F233F] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#0A1829]"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </header>
      )}
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Verificar typecheck**

Run: `npm run build`
Expected: PASA.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/auth/signout/route.ts src/app/admin/layout.tsx
git commit -m "feat(auth): cerrar sesión y barra superior del admin"
```

---

## Task 5: Página de login

**Files:**
- Create: `src/app/admin/login/page.tsx`

**Interfaces:**
- Consumes: `createClient` de `@/lib/supabase/client`.
- Produces: pantalla en `/admin/login`. Al autenticar → `router.push("/admin")` + `router.refresh()`.

- [ ] **Step 1: Crear la página de login**

`src/app/admin/login/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setMsg("Correo o contraseña incorrectos.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  async function handleForgot() {
    if (!email) {
      setMsg("Escribe tu correo para enviarte el enlace de recuperación.");
      return;
    }
    setMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/auth/callback?next=/admin/set-password`,
    });
    setMsg(
      error
        ? "No se pudo enviar el correo. Intenta de nuevo."
        : "Te enviamos un correo para restablecer tu contraseña.",
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0F233F] to-[#0A1829] px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl"
      >
        <h1 className="text-xl font-extrabold text-[#0F233F]">
          Panel de Administración
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Ingresa con tu correo y contraseña.
        </p>

        <label className="mt-6 block text-sm font-semibold text-[#1F2937]">
          Correo
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0F233F]"
        />

        <label className="mt-4 block text-sm font-semibold text-[#1F2937]">
          Contraseña
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0F233F]"
        />

        {msg && <p className="mt-3 text-sm text-[#B91019]">{msg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-[#E11D27] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#B91019] disabled:opacity-60"
        >
          {loading ? "Ingresando…" : "Ingresar"}
        </button>

        <button
          type="button"
          onClick={handleForgot}
          className="mt-4 w-full text-center text-xs font-medium text-[#6B7280] hover:text-[#0F233F]"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `npm run build`
Expected: PASA.

- [ ] **Step 3: Verificación funcional (dev)**

Run: `npm run dev`, ir a `/admin/productos` sin sesión.
Expected: redirige a `/admin/login` y **se ve la pantalla de login** con la marca (ya no 404).

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/login/page.tsx
git commit -m "feat(auth): página de login con recuperación de contraseña"
```

---

## Task 6: Página de set-password

**Files:**
- Create: `src/app/admin/set-password/page.tsx`

**Interfaces:**
- Consumes: `createClient` de `@/lib/supabase/client`.
- Produces: pantalla en `/admin/set-password`. Al guardar → `updateUser({ password })` → `router.push("/admin")` + `router.refresh()`. Requiere sesión (creada por el callback).

- [ ] **Step 1: Crear la página de set-password**

`src/app/admin/set-password/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (password.length < 8) {
      setMsg("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setMsg("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMsg(
        "No se pudo guardar. Es posible que el enlace haya expirado; pide una nueva invitación.",
      );
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0F233F] to-[#0A1829] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl"
      >
        <h1 className="text-xl font-extrabold text-[#0F233F]">
          Crea tu contraseña
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Define la contraseña con la que entrarás al panel.
        </p>

        <label className="mt-6 block text-sm font-semibold text-[#1F2937]">
          Contraseña
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0F233F]"
        />

        <label className="mt-4 block text-sm font-semibold text-[#1F2937]">
          Confirmar contraseña
        </label>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0F233F]"
        />

        {msg && <p className="mt-3 text-sm text-[#B91019]">{msg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-[#E11D27] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#B91019] disabled:opacity-60"
        >
          {loading ? "Guardando…" : "Guardar y entrar"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `npm run build`
Expected: PASA.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/set-password/page.tsx
git commit -m "feat(auth): página para crear/confirmar contraseña"
```

---

## Task 7: Escrituras del data-layer con el cliente con sesión

**Files:**
- Modify: `src/lib/products.ts` (funciones `addProduct`, `updateProduct`, `deleteProduct`)
- Modify: `src/lib/content.ts` (todas las funciones CRUD)
- Modify: `src/lib/supabase.ts` (`uploadProductImage`, `deleteProductImage`)

**Interfaces:**
- Consumes: `createClient` de `@/lib/supabase/client`.
- Produces: sin cambios de firma pública. Internamente las escrituras (y las lecturas de `content_plan`) usan el cliente con sesión para que RLS las permita.

Nota: las **lecturas de `products`** siguen usando el `supabase` anon (policy de SELECT pública). `content_plan` es admin-only, así que **todas** sus operaciones usan el cliente con sesión (si usara anon, RLS bloquea la lectura y el admin vería datos de ejemplo).

- [ ] **Step 1: `products.ts` — importar el cliente con sesión**

En `src/lib/products.ts`, agregar el import al inicio (debajo del import existente):
```ts
import { createClient } from "@/lib/supabase/client";
```

- [ ] **Step 2: `products.ts` — usar el cliente con sesión en las escrituras**

En `addProduct`, `updateProduct` y `deleteProduct`, reemplazar la referencia `supabase` de la operación por una instancia con sesión. Ejemplo para `addProduct` (aplicar el mismo patrón a las tres):
```ts
export async function addProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase not configured, cannot add product');
    return null;
  }

  const db = createClient();
  const { data, error } = await db
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) {
    console.error('Error adding product:', error);
    return null;
  }

  return data;
}
```
`updateProduct`: cambiar `supabase.from('products').update(...)` por `createClient().from('products').update(...)`.
`deleteProduct`: cambiar `supabase.from('products').delete()` por `createClient().from('products').delete()`.
Las funciones de lectura (`getProducts`, `getFeaturedProducts`, `getProductsByCategory`) **no se tocan**.

- [ ] **Step 3: `content.ts` — usar el cliente con sesión en TODAS las funciones**

En `src/lib/content.ts`, agregar el import:
```ts
import { createClient } from "@/lib/supabase/client";
```
Y como `supabase` dejará de usarse en este archivo, cambiar el import existente para dejar solo el helper:
```ts
import { isSupabaseConfigured } from "@/lib/supabase";
```
Luego, en `getContent`, `addContent`, `updateContent`, `deleteContent`, reemplazar cada uso de `supabase.from("content_plan")` por `createClient().from("content_plan")`. Ejemplo para `getContent`:
```ts
  try {
    const { data, error } = await createClient()
      .from("content_plan")
      .select("*")
      .order("scheduled_date", { ascending: true });
```
(mantener el resto de la lógica de fallback intacta).

- [ ] **Step 4: `supabase.ts` — storage con el cliente con sesión**

En `src/lib/supabase.ts`, agregar el import:
```ts
import { createClient } from "@/lib/supabase/client";
```
En `uploadProductImage` y `deleteProductImage`, reemplazar `supabase.storage` por `createClient().storage`. Ejemplo:
```ts
  const db = createClient();
  const { error } = await db.storage
    .from('product-images')
    .upload(filePath, file);
```

- [ ] **Step 5: Verificar typecheck**

Run: `npm run build`
Expected: PASA.

- [ ] **Step 6: Commit**

```bash
git add src/lib/products.ts src/lib/content.ts src/lib/supabase.ts
git commit -m "feat(auth): escrituras del admin usan el cliente con sesión (para RLS)"
```

---

## Task 8: Migración RLS + script de verificación (red → green)

**Files:**
- Create: `scripts/verify-rls.mjs`
- Create: `supabase/migrations/20260702000001_admin_auth_rls.sql`

**Interfaces:**
- Produces: migración que activa RLS en `products` y `content_plan`; script que, con la anon key, confirma que la lectura de `products` funciona y la escritura está bloqueada.

- [ ] **Step 1: Crear el script de verificación**

`scripts/verify-rls.mjs`:
```js
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, anon);

let ok = true;

// 1) Lectura pública de products debe funcionar.
const read = await supabase.from("products").select("id").limit(1);
if (read.error) {
  console.error("❌ Lectura pública de products FALLÓ:", read.error.message);
  ok = false;
} else {
  console.log("✅ Lectura pública de products OK");
}

// 2) Escritura con anon key debe estar BLOQUEADA.
const write = await supabase
  .from("products")
  .insert([{ title: "__rls_test__", category: "test", description: "x", quantity: 0, units_per_pallet: 0, image_url: "", featured: false, available: false }])
  .select();
if (write.error) {
  console.log("✅ Escritura anónima BLOQUEADA:", write.error.message);
} else {
  console.error("❌ Escritura anónima PERMITIDA (RLS no está protegiendo). Fila creada:", write.data);
  ok = false;
}

process.exit(ok ? 0 : 1);
```

- [ ] **Step 2: Correr el script ANTES de la migración (debe mostrar el hueco)**

Run: `node --env-file=.env.local scripts/verify-rls.mjs`
Expected: la lectura pasa, pero **la escritura anónima es PERMITIDA** → el script sale con código 1 y muestra "❌ Escritura anónima PERMITIDA". Esto documenta el estado inseguro actual (red).

_Nota: si se creó una fila `__rls_test__`, bórrala luego desde el dashboard o se limpia sola tras aplicar RLS + no volver a insertarla._

- [ ] **Step 3: Crear la migración RLS**

`supabase/migrations/20260702000001_admin_auth_rls.sql`:
```sql
-- products: catálogo público (lectura) + escritura solo autenticados
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_read" ON products
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "products_auth_insert" ON products
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "products_auth_update" ON products
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "products_auth_delete" ON products
  FOR DELETE TO authenticated USING (true);

-- content_plan: solo autenticados (no es público)
ALTER TABLE content_plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_auth_all" ON content_plan
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

- [ ] **Step 4: Aplicar la migración a la base**

Run: `npx supabase db push`
Expected: aplica `20260702000001_admin_auth_rls.sql` sin error. (Requiere el link/credenciales de Supabase ya presentes en el proyecto; si pide password usa `SUPABASE_DB_PASSWORD` de `.env.local`.)

- [ ] **Step 5: Correr el script DESPUÉS de la migración (green)**

Run: `node --env-file=.env.local scripts/verify-rls.mjs`
Expected: la lectura pasa y la **escritura anónima queda BLOQUEADA** → el script sale con código 0 y muestra "✅ Escritura anónima BLOQUEADA".

- [ ] **Step 6: Commit**

```bash
git add scripts/verify-rls.mjs supabase/migrations/20260702000001_admin_auth_rls.sql
git commit -m "feat(auth): RLS en products/content_plan + script de verificación"
```

---

## Task 9: Script para invitar usuarios

**Files:**
- Create: `scripts/invite-user.mjs`

**Interfaces:**
- Consumes: `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SITE_URL`.
- Produces: CLI `node --env-file=.env.local scripts/invite-user.mjs <correo>` → envía invitación con `redirectTo` al callback.

- [ ] **Step 1: Crear el script**

`scripts/invite-user.mjs`:
```js
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aoliquidationwarehouse.com";

const email = process.argv[2];
if (!email) {
  console.error(
    "Uso: node --env-file=.env.local scripts/invite-user.mjs correo@ejemplo.com",
  );
  process.exit(1);
}
if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
  redirectTo: `${siteUrl}/admin/auth/callback?next=/admin/set-password`,
});

if (error) {
  console.error("❌ Error al invitar:", error.message);
  process.exit(1);
}

console.log("✅ Invitación enviada a", email, "· user id:", data.user?.id);
```

- [ ] **Step 2: Verificar que el script arranca (validación de argumentos)**

Run: `node --env-file=.env.local scripts/invite-user.mjs`
Expected: imprime el mensaje de "Uso:" y sale con código 1 (sin llamar a la API). Confirma que el script carga sin errores de sintaxis. _La invitación real se prueba en Task 11, después de configurar el SMTP._

- [ ] **Step 3: Commit**

```bash
git add scripts/invite-user.mjs
git commit -m "feat(auth): script para invitar usuarios por correo"
```

---

## Task 10: Checklist de configuración (Supabase / Resend / Vercel)

**Files:**
- Create: `docs/superpowers/checklists/admin-auth-setup.md`

**Interfaces:**
- Produces: documento de pasos de interfaz (no-código) necesarios para que el flujo funcione en producción.

- [ ] **Step 1: Crear el checklist**

`docs/superpowers/checklists/admin-auth-setup.md`:
```markdown
# Checklist de configuración — Auth del Admin

## Supabase Dashboard → Authentication
- [ ] Providers → Email: habilitado.
- [ ] Providers → Email: **desactivar** "Allow new users to sign up" (invitación-solo).
- [ ] URL Configuration → Site URL: `https://aoliquidationwarehouse.com`.
- [ ] URL Configuration → Redirect URLs (agregar ambas):
  - `https://aoliquidationwarehouse.com/admin/auth/callback`
  - `http://localhost:3000/admin/auth/callback`
- [ ] SMTP Settings (Custom SMTP):
  - Host: `smtp.resend.com`
  - Port: `465` (o `587`)
  - Username: `resend`
  - Password: el valor de `RESEND_API_KEY`
  - Sender email: `noreply@send.bralto.io`
  - Sender name: `AO Liquidation Warehouse`
- [ ] Email Templates → "Invite user" y "Reset password": redactar en español con la marca.

## Env / Vercel
- [ ] `NEXT_PUBLIC_SITE_URL=https://aoliquidationwarehouse.com` en `.env.local` y en Vercel.
- [ ] Confirmar en Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`.

## Base de datos
- [ ] `npx supabase db push` aplicó `20260702000001_admin_auth_rls.sql`.
- [ ] `node --env-file=.env.local scripts/verify-rls.mjs` sale con código 0.
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/checklists/admin-auth-setup.md
git commit -m "docs(auth): checklist de configuración Supabase/Resend/Vercel"
```

---

## Task 11: Verificación E2E completa

**Files:** (ninguno — verificación manual)

**Prerrequisitos:** Task 10 completado (SMTP + redirect URLs + signup desactivado), migración RLS aplicada.

- [ ] **Step 1: Invitar un correo propio**

Run: `node --env-file=.env.local scripts/invite-user.mjs TU-CORREO@ejemplo.com`
Expected: "✅ Invitación enviada". Llega un correo desde `noreply@send.bralto.io`.

- [ ] **Step 2: Aceptar la invitación**

Abrir el enlace del correo.
Expected: aterriza en `/admin/set-password`. Definir una contraseña (≥8, coincidente) → cae en `/admin` con la barra superior mostrando tu email.

- [ ] **Step 3: Cerrar sesión**

Clic en "Cerrar sesión".
Expected: redirige a `/admin/login`.

- [ ] **Step 4: Login**

Ingresar con el correo y la contraseña recién creada.
Expected: entra a `/admin`.

- [ ] **Step 5: Guard sin sesión**

En una ventana privada (sin sesión), ir a `/admin/productos`.
Expected: redirige a `/admin/login`.

- [ ] **Step 6: RLS**

Run: `node --env-file=.env.local scripts/verify-rls.mjs`
Expected: código 0 — lectura OK, escritura anónima bloqueada.

- [ ] **Step 7: Catálogo público**

Ir a `/catalogo` (sin sesión).
Expected: los productos se ven normal (lectura pública OK).

- [ ] **Step 8: Escritura autenticada**

Logueado, en `/admin/productos`, crear/editar/borrar un producto de prueba.
Expected: la operación funciona (el cliente con sesión pasa RLS).

- [ ] **Step 9: Recuperación de contraseña**

En `/admin/login` → "¿Olvidaste tu contraseña?" con tu correo.
Expected: llega el correo; el enlace lleva a `/admin/set-password`; cambias la contraseña y entras.
