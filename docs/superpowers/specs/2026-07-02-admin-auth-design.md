# Diseño: Autenticación del Admin Panel

**Proyecto:** AO Liquidation Warehouse
**Fecha:** 2026-07-02
**Estado:** Aprobado (pendiente de plan de implementación)

## Contexto y problema

Hoy el panel `/admin` está **100% público**: no hay middleware, ni login, ni sesión.
`src/app/admin/layout.tsx` es un passthrough vacío y no existe `middleware.ts`. Cualquiera
con la URL puede crear/editar/borrar productos y contenido.

Además, las tablas `products` y `content_plan` **no tienen RLS**: se escriben desde el navegador
con la **anon key pública**, por lo que proteger solo la pantalla no basta — un tercero podría
escribir directo a la base con esa llave. El bucket de storage `product-images` **sí** está bien
(lectura pública, escritura solo `authenticated`).

Supabase ya está integrado (`@supabase/supabase-js` y **`@supabase/ssr` ya instalados**), sobre
Next.js 14.2.23 (App Router), así que agregar Supabase Auth es el camino natural.

## Objetivo

1. Proteger `/admin/*` con login de Supabase (sesión por cookie).
2. Flujo de alta por invitación: se crea el usuario → recibe correo → define contraseña → queda
   **logueado y redirigido a `/admin`**.
3. Cerrar la base con RLS: catálogo público solo-lectura, escrituras solo para usuarios logueados.

## Decisiones tomadas

- **Creación de usuarios:** vía script que corre el desarrollador (`inviteUserByEmail`). Sin UI de
  gestión de usuarios por ahora (YAGNI).
- **Nivel de seguridad:** completo — UI (middleware) + datos (RLS).
- **Correo:** Supabase envía los correos de auth vía **Resend como SMTP** (dominio verificado,
  remitente `noreply@send.bralto.io`). `RESEND_API_KEY` ya está en `.env.local`.
- **Dominio de producción:** `https://aoliquidationwarehouse.com`.
- **Modelo de acceso:** invitación-solo; cualquier usuario existente = admin total.

## Arquitectura

Autenticación basada en cookies con `@supabase/ssr`. Dos clientes:

- **Cliente de navegador con sesión** (`src/lib/supabase/client.ts`, `createBrowserClient`): lo usan
  las páginas del admin para **escrituras** (llevan el JWT del usuario → RLS las permite).
- **Cliente de servidor** (`src/lib/supabase/server.ts`, `createServerClient`): lo usan el middleware
  y los route handlers para leer/refrescar la sesión desde cookies.
- **Cliente anon público existente** (`src/lib/supabase.ts`): se mantiene para **lecturas públicas**
  (catálogo). Funciona en server y client components porque la policy de SELECT es pública.

### Archivos nuevos

| Archivo | Propósito |
|---|---|
| `src/lib/supabase/client.ts` | Cliente de navegador con sesión (escrituras admin). |
| `src/lib/supabase/server.ts` | Cliente de servidor (middleware / route handlers). |
| `middleware.ts` (raíz) | Refresca sesión y protege `/admin/*`. |
| `src/app/admin/login/page.tsx` | Login con marca (email + contraseña) + "¿Olvidaste tu contraseña?". |
| `src/app/admin/set-password/page.tsx` | Crear/confirmar contraseña tras invitación o recuperación. |
| `src/app/admin/auth/callback/route.ts` | Canjea el `code` del enlace por sesión y redirige. |
| `src/app/admin/auth/signout/route.ts` | Cierra sesión. |
| `scripts/invite-user.mjs` | Script (service-role) para invitar usuarios. |
| `supabase/migrations/20260702000001_admin_auth_rls.sql` | Activa RLS + policies en `products` y `content_plan`. |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/app/admin/layout.tsx` | Barra superior con email del usuario + botón "Cerrar sesión". |
| `src/lib/products.ts` | Las funciones de **escritura** (`addProduct`, `updateProduct`, `deleteProduct`) usan el cliente con sesión. Las de lectura no cambian. |
| `src/lib/content.ts` | Igual: escrituras con el cliente con sesión. |
| `src/lib/supabase.ts` | `uploadProductImage` / `deleteProductImage` usan el cliente con sesión. Lecturas y helpers sin cambio. |

## Flujo de invitación → contraseña → logueado

1. El desarrollador ejecuta `node scripts/invite-user.mjs correo@ejemplo.com`.
   - Usa `SUPABASE_SERVICE_ROLE_KEY` → `supabase.auth.admin.inviteUserByEmail(email, {
     redirectTo: 'https://aoliquidationwarehouse.com/admin/auth/callback?next=/admin/set-password' })`.
2. Supabase envía el correo de invitación (vía Resend) con el enlace de confirmación.
3. La persona hace clic → Supabase verifica y redirige a `/admin/auth/callback?code=...&next=/admin/set-password`.
4. El route handler del callback crea la sesión y redirige a `next` (`/admin/set-password`).
   Por robustez maneja **ambos** formatos de enlace de Supabase: si llega `?code=...` usa
   `exchangeCodeForSession(code)` (flujo PKCE); si llega `?token_hash=...&type=...` usa
   `verifyOtp({ token_hash, type })`. Setea cookies de sesión en cualquiera de los dos casos.
5. En `/admin/set-password` la persona ingresa la contraseña dos veces → `supabase.auth.updateUser({
   password })` → al éxito, **redirige a `/admin`** ya con sesión activa.
6. **Logins posteriores:** `/admin/login` con email + contraseña → `signInWithPassword` → `/admin`.
7. **Recuperación:** enlace "¿Olvidaste tu contraseña?" → `resetPasswordForEmail(email, { redirectTo:
   .../admin/auth/callback?next=/admin/set-password })` → mismo callback y set-password.

## Protección de rutas (middleware)

- `matcher`: `['/admin/:path*']`.
- En cada request refresca la sesión (patrón `@supabase/ssr`).
- **Rutas exentas del guard** (accesibles sin sesión): las que empiezan con `/admin/login` o
  `/admin/auth`. El resto de `/admin/*` exige sesión.
- Sin sesión en ruta protegida → redirige a `/admin/login`.
- `/admin/set-password` exige sesión (se llega a ella ya con sesión creada por el callback).
- Con sesión y visitando `/admin/login` → redirige a `/admin`.

## Seguridad de datos (RLS)

Migración nueva:

```sql
-- products: catálogo público (lectura) + escritura solo autenticados
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read"   ON products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "products_auth_insert"   ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "products_auth_update"   ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "products_auth_delete"   ON products FOR DELETE TO authenticated USING (true);

-- content_plan: solo autenticados (no es público)
ALTER TABLE content_plan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content_auth_all" ON content_plan FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

- Storage `product-images`: sin cambios (ya correcto).
- La anon key sigue siendo pública (es su naturaleza); la seguridad ahora la aplica RLS, no ocultar
  la llave.
- Tras activar RLS, las escrituras del admin funcionan **porque** el cliente de navegador lleva el
  JWT del usuario logueado (`auth.role() = 'authenticated'`).
- **Validado en el código:** `content_plan` solo lo lee `src/app/admin/contenido/page.tsx` (ninguna
  página pública), y todas las lecturas de `products` ocurren en client components
  (`/catalogo`, `FeaturedProducts`, admin) que usan la anon key — la policy de SELECT pública las
  mantiene funcionando.

## Configuración (una sola vez, mayormente en interfaz)

**Supabase Dashboard → Authentication:**
- Providers → Email: habilitado. **Desactivar** "Allow new users to sign up" (invitación-solo).
- URL Configuration → Site URL: `https://aoliquidationwarehouse.com`.
- URL Configuration → Redirect URLs (allowlist):
  `https://aoliquidationwarehouse.com/admin/auth/callback` y `http://localhost:3000/admin/auth/callback`.
- SMTP Settings: host `smtp.resend.com`, port `465` (o `587`), user `resend`, password = `RESEND_API_KEY`,
  sender email `noreply@send.bralto.io`, sender name `AO Liquidation Warehouse`.
- Email Templates → "Invite user" y "Reset password": personalizadas, en español, con marca.

**Env / Vercel:**
- `RESEND_API_KEY` (ya existe), `SUPABASE_SERVICE_ROLE_KEY` (ya existe).
- Agregar `NEXT_PUBLIC_SITE_URL=https://aoliquidationwarehouse.com`.
- Replicar todas las variables relevantes en el proyecto de Vercel.

## Manejo de errores

- Callback con código inválido/expirado → página de error amable con opción de "pedir nueva invitación".
- Login con credenciales incorrectas → error en línea.
- Set-password: contraseña < 8 caracteres o que no coincide → validación en línea antes de enviar.
- Errores de rate-limit de correo → mensaje claro.

## Plan de pruebas (manual E2E)

1. Invitar a un correo propio → llega el correo desde `noreply@send.bralto.io`.
2. Clic en el enlace → aterriza en set-password → definir contraseña → cae en `/admin` logueado.
3. Cerrar sesión → redirige a `/admin/login`.
4. Login con la contraseña → entra a `/admin`.
5. Sin sesión, visitar `/admin/productos` → redirige a `/admin/login`.
6. Verificar RLS: intento de escritura a `products`/`content_plan` con anon key (sin sesión) → **bloqueado**.
7. Verificar que el catálogo público del sitio sigue mostrando productos (lectura pública OK).

## Fuera de alcance (YAGNI)

Roles/permisos por niveles, UI de gestión de usuarios, 2FA, login social/SSO, logs de auditoría.
Se pueden agregar después sin rehacer esta base.
