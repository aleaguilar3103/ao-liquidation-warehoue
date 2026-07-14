# Catálogo: Estados + Visibilidad — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el booleano `available` por un estado de producto de 6 valores (con etiquetas/colores públicos) y agregar un control interno de visibilidad, corrigiendo de paso los bugs del catálogo.

**Architecture:** Una fuente única de verdad en `src/lib/product-status.ts` define los estados (label, color, si activa WhatsApp). La BD gana `status TEXT` + `is_visible BOOLEAN`. El catálogo público y destacados filtran por `is_visible` y se convierten a server components; el admin edita estado + visibilidad. Migración aditiva-primero contra prod vía Management API.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind, shadcn/ui, Supabase (Postgres + Storage).

## Global Constraints

- **Migraciones a prod:** vía Supabase Management API, NO `supabase db push` (flujo de deploy del proyecto).
- **Deploy:** push a `main` → Vercel. Trabajo en rama `feat/catalogo-estado-visibilidad`.
- **Verificación:** no hay test runner. Cada tarea cierra con `npx tsc --noEmit` limpio y, donde aplique, `npm run build`. La migración se verifica con SQL de conteo. Los cambios de UI con checks funcionales en `npm run dev`.
- **Idioma:** UI y comentarios en español; identificadores en inglés.
- **Estados válidos (exactos):** `disponible`, `pocas_unidades`, `proximamente`, `en_camino`, `agotado`, `no_disponible`.
- **WhatsApp activo en:** `disponible`, `pocas_unidades`, `proximamente`, `en_camino`. Deshabilitado en `agotado`, `no_disponible`.
- **Orden de seguridad de la migración:** aditivo + poblar + verificar ANTES de tocar código; destructivo (drop `available`/`condition`) SOLO al final, cuando el código nuevo ya no los usa.

## File Structure

- `src/lib/product-status.ts` — **Create.** Fuente única: tipo `ProductStatus`, `PRODUCT_STATUSES`, `DEFAULT_STATUS`, `getStatusConfig()`.
- `src/lib/products.ts` — **Modify.** `Product` interface; `getFeaturedProducts` filtra visibles; nueva `getPublicProducts`.
- `src/types/supabase.ts` — **Modify.** Reflejar `status` + `is_visible`; quitar `available`/`condition` (al final).
- `src/app/admin/productos/page.tsx` — **Modify.** Form (Select estado + Switch visibilidad + datalist categoría), listados grid/tabla, `toggleVisibility`.
- `src/components/ProductCard.tsx` — **Modify.** Badge desde config; `next/image`; fallback imagen.
- `src/components/ProductModal.tsx` — **Modify.** Badge desde config; gating WhatsApp por estado.
- `src/app/catalogo/page.tsx` — **Modify → split.** Server component (fetch) + `CatalogClient` (filtro categorías + estado vacío).
- `src/components/catalogo/CatalogClient.tsx` — **Create.** Cliente con el filtro de categorías y el grid.
- `src/components/home/FeaturedProducts.tsx` — **Modify → split.** Server component (fetch) + render de `ProductCard`.
- Migraciones SQL — aplicadas vía Management API (documentadas en tareas 2 y 7).

---

### Task 1: Módulo de estados (fuente única de verdad)

**Files:**
- Create: `src/lib/product-status.ts`

**Interfaces:**
- Produces:
  - `type ProductStatus = 'disponible' | 'pocas_unidades' | 'proximamente' | 'en_camino' | 'agotado' | 'no_disponible'`
  - `interface ProductStatusConfig { value: ProductStatus; label: string; badgeClass: string; contactEnabled: boolean }`
  - `const PRODUCT_STATUSES: ProductStatusConfig[]`
  - `const DEFAULT_STATUS: ProductStatus`
  - `function getStatusConfig(status: string | null | undefined): ProductStatusConfig` (fallback a `disponible`)

- [ ] **Step 1: Crear el módulo**

```ts
// src/lib/product-status.ts
export type ProductStatus =
  | "disponible"
  | "pocas_unidades"
  | "proximamente"
  | "en_camino"
  | "agotado"
  | "no_disponible";

export interface ProductStatusConfig {
  value: ProductStatus;
  label: string;
  /** Clases Tailwind del badge (fondo + texto). */
  badgeClass: string;
  /** ¿El botón de WhatsApp queda activo en este estado? */
  contactEnabled: boolean;
}

export const PRODUCT_STATUSES: ProductStatusConfig[] = [
  { value: "disponible",     label: "Disponible",             badgeClass: "bg-green-500 text-white", contactEnabled: true },
  { value: "pocas_unidades", label: "Quedan pocas unidades",  badgeClass: "bg-amber-500 text-white", contactEnabled: true },
  { value: "proximamente",   label: "Próximamente",           badgeClass: "bg-blue-500 text-white",  contactEnabled: true },
  { value: "en_camino",      label: "En camino",              badgeClass: "bg-teal-500 text-white",  contactEnabled: true },
  { value: "agotado",        label: "Agotado",                badgeClass: "bg-red-500 text-white",   contactEnabled: false },
  { value: "no_disponible",  label: "No disponible",          badgeClass: "bg-gray-500 text-white",  contactEnabled: false },
];

export const DEFAULT_STATUS: ProductStatus = "disponible";

const STATUS_MAP: Record<string, ProductStatusConfig> = Object.fromEntries(
  PRODUCT_STATUSES.map((s) => [s.value, s]),
);

/** Lookup seguro: si el valor no existe, cae a `disponible`. */
export function getStatusConfig(
  status: string | null | undefined,
): ProductStatusConfig {
  return (status && STATUS_MAP[status]) || STATUS_MAP[DEFAULT_STATUS];
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/lib/product-status.ts
git commit -m "feat(catalogo): módulo fuente-única de estados de producto"
```

---

### Task 2: Migración aditiva + poblar + verificar (prod)

**Files:**
- Ninguno de código en este paso (SQL vía Management API).

**Interfaces:**
- Produces: columnas `products.status` (TEXT NOT NULL default 'disponible') y `products.is_visible` (BOOLEAN NOT NULL default true), pobladas.

- [ ] **Step 1: Aplicar SQL aditivo vía Management API**

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'disponible';
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true;

UPDATE products SET status = 'no_disponible' WHERE available = false;
UPDATE products SET status = 'disponible'   WHERE available = true OR available IS NULL;
```

- [ ] **Step 2: Verificar poblado**

```sql
SELECT status, count(*) FROM products GROUP BY status ORDER BY status;
SELECT count(*) AS invalidos FROM products
  WHERE status NOT IN ('disponible','pocas_unidades','proximamente','en_camino','agotado','no_disponible');
SELECT count(*) AS ocultos FROM products WHERE is_visible = false;
```
Expected: `invalidos = 0`; `ocultos = 0`; la suma por `status` = total de productos.

- [ ] **Step 3: (sin commit de código)** Anotar en el PR/nota que la migración aditiva quedó aplicada. `available` y `condition` NO se tocan aún.

---

### Task 3: Capa de datos + tipos (transitorio, mantiene build verde)

**Files:**
- Modify: `src/types/supabase.ts` (agregar `status`, `is_visible` a Row/Insert/Update; conservar `available` por ahora)
- Modify: `src/lib/products.ts:4-17` (Product), `:43-66` (getFeaturedProducts), nueva `getPublicProducts`

**Interfaces:**
- Consumes: `ProductStatus` de Task 1.
- Produces:
  - `Product` con `status: ProductStatus`, `is_visible: boolean` (y aún `available?: boolean` opcional transitorio).
  - `getPublicProducts(): Promise<Product[]>` — solo `is_visible = true`.

- [ ] **Step 1: Agregar columnas al tipo generado**

En `src/types/supabase.ts`, dentro de `products.Row`, `.Insert`, `.Update`, agregar (junto a los existentes):
```ts
          is_visible: boolean | null
          status: string | null
```
(en Insert/Update como `is_visible?: boolean | null` y `status?: string | null`). Conservar `available` y `condition` por ahora.

- [ ] **Step 2: Actualizar `Product` y la capa de datos**

En `src/lib/products.ts`:
```ts
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/client";
import type { ProductStatus } from "@/lib/product-status";

export interface Product {
  id: string;
  title: string;
  category: string;
  description: string;
  quantity: number;
  units_per_pallet: number;
  image_url: string;
  additional_images?: string[];
  featured: boolean;
  status: ProductStatus;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}
```
Agregar la nueva función (después de `getProducts`):
```ts
export async function getPublicProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_visible", true)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching public products:", error);
    return [];
  }
  return data || [];
}
```
En `getFeaturedProducts`, agregar el filtro de visibilidad a la query existente:
```ts
    .eq("featured", true)
    .eq("is_visible", true)
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: los ÚNICOS errores esperados son en sitios que aún leen `product.available` (admin, ProductCard, ProductModal) — se arreglan en Tasks 4–6. Si aparecen errores distintos, corregir antes de seguir.

Nota: para mantener el build 100% verde entre tareas, se puede dejar `available?: boolean` como opcional transitorio en `Product`; se elimina en Task 7.

- [ ] **Step 4: Commit**

```bash
git add src/types/supabase.ts src/lib/products.ts
git commit -m "feat(catalogo): status + is_visible en tipos y capa de datos"
```

---

### Task 4: Admin — formulario + listados + visibilidad

**Files:**
- Modify: `src/app/admin/productos/page.tsx` — `FormData`/`EMPTY_FORM` (68-86), `startEdit` (173-189), `toggleAvailability`→`toggleVisibility` (308-330), form (603-628), grid (891-940), tabla (1015-1028), header tabla (976-977).

**Interfaces:**
- Consumes: `PRODUCT_STATUSES`, `getStatusConfig`, `DEFAULT_STATUS` de Task 1; `Product` de Task 3.
- Produces: admin escribe `status` + `is_visible` en create/update.

- [ ] **Step 1: Imports y FormData**

Agregar import:
```ts
import { PRODUCT_STATUSES, getStatusConfig, DEFAULT_STATUS, type ProductStatus } from "@/lib/product-status";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
```
Cambiar `FormData` y `EMPTY_FORM`: quitar `available: boolean`, agregar `status: ProductStatus` e `is_visible: boolean`.
```ts
interface FormData {
  title: string; category: string; description: string;
  quantity: number; units_per_pallet: number;
  featured: boolean; status: ProductStatus; is_visible: boolean;
}
const EMPTY_FORM: FormData = {
  title: "", category: "", description: "",
  quantity: 0, units_per_pallet: 0,
  featured: false, status: DEFAULT_STATUS, is_visible: true,
};
```

- [ ] **Step 2: `startEdit` carga los nuevos campos**

Reemplazar `available: product.available ?? true,` por:
```ts
      status: product.status ?? DEFAULT_STATUS,
      is_visible: product.is_visible ?? true,
```

- [ ] **Step 3: Reemplazar la casilla "Disponible" por Select de estado + Switch de visibilidad**

Sustituir el bloque `<label htmlFor="available">…</label>` (603-627) por un Select de estado y, debajo del grid featured/estado, un switch de visibilidad:
```tsx
<div className="space-y-1.5">
  <Label htmlFor="status">Estado</Label>
  <Select
    value={formData.status}
    onValueChange={(v) => setFormData({ ...formData, status: v as ProductStatus })}
  >
    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
    <SelectContent>
      {PRODUCT_STATUSES.map((s) => (
        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

<label
  htmlFor="is_visible"
  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
    formData.is_visible ? "border-brand/40 bg-brand/5" : "border-gray-200 hover:border-gray-300 bg-white"
  }`}
>
  <Checkbox
    id="is_visible"
    checked={formData.is_visible}
    onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked === true })}
    className="mt-0.5"
  />
  <div className="flex-1">
    <div className="font-medium text-gray-900">Visible en el sitio</div>
    <p className="text-xs text-gray-500 mt-0.5">
      Interno: si lo desmarcas, el producto no aparece en el catálogo ni en destacados.
    </p>
  </div>
</label>
```
(El `featured` se mantiene igual; el Select de estado va antes del grid de checkboxes.)

- [ ] **Step 4: `toggleVisibility` en vez de `toggleAvailability`**

Renombrar y ajustar (308-330):
```ts
const toggleVisibility = async (product: Product) => {
  const success = await updateProduct(product.id, { is_visible: !product.is_visible });
  if (success) {
    toast({
      title: "Visibilidad actualizada",
      description: `"${product.title}" ahora está ${!product.is_visible ? "visible" : "oculto"}.`,
    });
    fetchProducts();
  } else {
    toast({ title: "Error", description: "No se pudo actualizar la visibilidad.", variant: "destructive" });
  }
};
```
(Nota: se envía solo `{ is_visible }`, no el objeto completo — evita mandar `id`/`created_at`.)

- [ ] **Step 5: Grid — badge de estado + switch de visibilidad**

En la grid (891-897) reemplazar el badge `available` por el del estado:
```tsx
{(() => { const c = getStatusConfig(product.status); return (
  <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-bold ${c.badgeClass}`}>
    {c.label}
  </div>
); })()}
```
Y el bloque del `Switch` (932-940) pasa a controlar visibilidad:
```tsx
<div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
  <span className="text-sm font-medium text-gray-700">Visible en el sitio</span>
  <Switch checked={product.is_visible} onCheckedChange={() => toggleVisibility(product)} />
</div>
```

- [ ] **Step 6: Tabla — columna Estado (badge) + Visibilidad (switch)**

En el header (976-977) dejar dos columnas: `<TableHead className="text-center">Estado</TableHead>` y `<TableHead className="text-center">Visible</TableHead>`.
Reemplazar la celda de disponibilidad (1015-1028) por:
```tsx
<TableCell className="text-center">
  {(() => { const c = getStatusConfig(product.status); return (
    <Badge className={c.badgeClass}>{c.label}</Badge>
  ); })()}
</TableCell>
<TableCell className="text-center">
  <Switch checked={product.is_visible} onCheckedChange={() => toggleVisibility(product)} />
</TableCell>
```
(La columna "Estado" que hoy muestra Destacado/Normal pasa a ser una tercera si se desea; mínimo: Estado = badge de status, Visible = switch. Ajustar el número de `<TableHead>` para que cuadre con las celdas.)

- [ ] **Step 7: Autocompletado de categoría (datalist)**

Al `Input` de categoría (513-521) agregar `list="categorias"` y, tras el input, un datalist con las categorías existentes:
```tsx
<Input id="category" list="categorias" value={formData.category}
  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
  required placeholder="Ej: Electrónicos" />
<datalist id="categorias">
  {Array.from(new Set(products.map((p) => p.category))).filter(Boolean).map((c) => (
    <option key={c} value={c} />
  ))}
</datalist>
```

- [ ] **Step 8: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: sin errores en `admin/productos/page.tsx`. (Pueden quedar errores en ProductCard/ProductModal hasta Task 5.)

- [ ] **Step 9: Commit**

```bash
git add src/app/admin/productos/page.tsx
git commit -m "feat(admin): selector de estado + switch de visibilidad + datalist categoría"
```

---

### Task 5: Sitio público — ProductCard + ProductModal

**Files:**
- Modify: `src/components/ProductCard.tsx:27-40` (img→next/image, badge estado)
- Modify: `src/components/ProductModal.tsx:181-194` (badge estado), `:238-254` (gating WhatsApp)

**Interfaces:**
- Consumes: `getStatusConfig` de Task 1.

- [ ] **Step 1: ProductCard — next/image + badge de estado**

Agregar `import Image from "next/image";` y `import { getStatusConfig } from "@/lib/product-status";`. Reemplazar el `<img>` (27-31) y el badge (36-40):
```tsx
<div className="relative h-64 overflow-hidden">
  {product.image_url ? (
    <Image src={product.image_url} alt={product.title} fill sizes="(max-width:768px) 100vw, 33vw"
      className="object-cover hover:scale-110 transition-transform duration-300" />
  ) : (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
      Sin imagen
    </div>
  )}
  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-brand to-brand-dark text-white z-10">
    {product.category}
  </Badge>
  {(() => { const c = getStatusConfig(product.status); return (
    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold z-10 ${c.badgeClass}`}>
      {c.label}
    </div>
  ); })()}
</div>
```

- [ ] **Step 2: ProductModal — badge + gating WhatsApp por estado**

Agregar `import { getStatusConfig } from "@/lib/product-status";`. En el header de badges (185-193) usar el config; y el botón WhatsApp (238-254) se deshabilita según `contactEnabled`:
```tsx
const statusCfg = getStatusConfig(product.status); // cerca del inicio del componente
```
Badge:
```tsx
<Badge className={statusCfg.badgeClass}>{statusCfg.label}</Badge>
```
Botón:
```tsx
<Button asChild={statusCfg.contactEnabled} size="lg" disabled={!statusCfg.contactEnabled}
  className="w-full bg-gradient-to-r from-brand to-brand-dark hover:from-brand-dark hover:to-brand text-white">
  {statusCfg.contactEnabled ? (
    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
      <MessageCircle className="mr-2 w-4 h-4 md:w-5 md:h-5" />
      Contactar por WhatsApp
    </a>
  ) : (
    <span><MessageCircle className="mr-2 w-4 h-4 md:w-5 md:h-5 inline" />{statusCfg.label}</span>
  )}
</Button>
```
(`asChild` no puede envolver un elemento deshabilitado con `<a>`; por eso se alterna a `<span>` cuando el contacto está deshabilitado.)

- [ ] **Step 3: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/components/ProductCard.tsx src/components/ProductModal.tsx
git commit -m "feat(catalogo): tarjeta y modal con estado + next/image + gating WhatsApp"
```

---

### Task 6: Catálogo SSR + estado vacío, y FeaturedProducts SSR

**Files:**
- Modify: `src/app/catalogo/page.tsx` (→ server component)
- Create: `src/components/catalogo/CatalogClient.tsx`
- Modify: `src/components/home/FeaturedProducts.tsx` (→ server component)

**Interfaces:**
- Consumes: `getPublicProducts`, `getFeaturedProducts` de Task 3; `Product`.

- [ ] **Step 1: Extraer el cliente del catálogo**

Crear `src/components/catalogo/CatalogClient.tsx` con TODO lo interactivo (filtro de categorías + grid + estado vacío por categoría), recibiendo `products: Product[]` por props. Mover el JSX actual de `catalogo/page.tsx` (líneas 42-86) aquí, quitando el `useEffect`/fetch y recibiendo `products` por props; conservar el `useState` de `selectedCategory`.

- [ ] **Step 2: Convertir la página a server component + estado vacío**

`src/app/catalogo/page.tsx`:
```tsx
import CatalogClient from "@/components/catalogo/CatalogClient";
import { getPublicProducts } from "@/lib/products";

export default async function CatalogoPage() {
  const products = await getPublicProducts();
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
            Catálogo de Pallets
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explora nuestra amplia selección de pallets de liquidación
          </p>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">
              Pronto publicaremos nuevos pallets. Vuelve a visitarnos.
            </p>
          </div>
        ) : (
          <CatalogClient products={products} />
        )}
      </div>
    </div>
  );
}
```
**Esto corrige el bug #1** (ya no hay `return null` → pantalla en blanco): el header y el mensaje siempre se muestran.

- [ ] **Step 3: FeaturedProducts a server component**

Convertir `src/components/home/FeaturedProducts.tsx` a `async` server component que hace `const featuredProducts = await getFeaturedProducts();` y renderiza el grid de `<ProductCard>` (quitando `"use client"`, `useState`, `useEffect`). Si `featuredProducts.length === 0`, retornar `null` como hoy (aquí sí es correcto: es una sección embebida, no la página entera). `ProductCard` sigue siendo client component y se puede renderizar desde un server component sin problema.

- [ ] **Step 4: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: build exitoso; `/catalogo` y `/` compilan.

- [ ] **Step 5: Checks funcionales**

Run: `npm run dev`. Verificar:
- `/catalogo`: se ven solo productos visibles; cada uno con su badge de estado y color; filtro de categorías funciona.
- Un producto marcado "Oculto" en el admin desaparece de `/catalogo` y de destacados.
- Estados `agotado`/`no_disponible`: en el modal el botón WhatsApp queda deshabilitado.
- Si no hay productos visibles: `/catalogo` muestra el mensaje, no pantalla en blanco.

- [ ] **Step 6: Commit**

```bash
git add src/app/catalogo/page.tsx src/components/catalogo/CatalogClient.tsx src/components/home/FeaturedProducts.tsx
git commit -m "feat(catalogo): catálogo y destacados a server components + estado vacío"
```

---

### Task 7: Limpieza final + migración destructiva

**Files:**
- Modify: `src/lib/products.ts` (quitar `available?` transitorio si se dejó)
- Modify: `src/types/supabase.ts` (quitar `available` y `condition`)
- SQL destructivo vía Management API.

**Interfaces:** ninguna nueva.

- [ ] **Step 1: Confirmar que el código ya no referencia `available` ni `condition`**

Run: `grep -rniE "\.available|available:|condition" src/ --include="*.ts" --include="*.tsx" | grep -v "slots\|booking"`
Expected: sin resultados en el dominio de productos (los de booking `available` son de otro feature y se ignoran).

- [ ] **Step 2: Quitar `available`/`condition` de los tipos**

Eliminar `available` y `condition` de `products.Row/Insert/Update` en `src/types/supabase.ts`, y el `available?` transitorio en `Product` si se dejó.

- [ ] **Step 3: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: sin errores.

- [ ] **Step 4: Deploy del código ANTES del drop**

```bash
git add -A && git commit -m "chore(catalogo): retira available/condition del código"
```
Merge/push a `main` → esperar deploy de Vercel. (El código nuevo ya no depende de esas columnas, así que dropearlas no rompe prod.)

- [ ] **Step 5: SQL destructivo vía Management API**

```sql
ALTER TABLE products DROP COLUMN IF EXISTS available;
ALTER TABLE products DROP COLUMN IF EXISTS condition;
```

- [ ] **Step 6: Verificación final**

```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'products' ORDER BY column_name;
```
Expected: aparecen `status`, `is_visible`; NO aparecen `available`, `condition`.

---

## Self-Review

**Spec coverage:**
- Estados (6, config única) → Task 1 ✅
- Migración status + is_visible + poblar → Task 2 ✅
- Capa de datos (getPublicProducts, filtros, tipos) → Task 3 ✅
- Admin (Select estado, switch visibilidad, listados, datalist) → Task 4 ✅
- Público (ProductCard badge + next/image + fallback, Modal badge + gating) → Task 5 ✅
- Catálogo SSR + estado vacío (bug #1), Featured SSR (bug #5) → Task 6 ✅
- Drop condition (bug #7) + drop available → Task 7 ✅
- Bug #3 (tipos nulos/fallback imagen) → Tasks 3 y 5 ✅
- Bug #4 (next/image) → Task 5 ✅
- Bug #6 (datalist categoría) → Task 4 ✅

**Placeholder scan:** sin TBD/TODO; todos los pasos con código real.

**Type consistency:** `ProductStatus`, `getStatusConfig`, `PRODUCT_STATUSES`, `DEFAULT_STATUS`, `is_visible`, `status`, `getPublicProducts`, `toggleVisibility` usados consistentes entre tareas.

**Nota de riesgo:** el único paso irreversible es Task 7 Step 5 (drop de columnas). Va deliberadamente al final, tras verificar (grep) que el código ya no las usa y tras el deploy del código nuevo.
