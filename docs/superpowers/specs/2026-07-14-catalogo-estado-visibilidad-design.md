# Catálogo: Estados de producto + Visibilidad (diseño)

**Fecha:** 2026-07-14
**Estado:** Aprobado (pendiente de plan de implementación)

## Contexto

Los productos del catálogo se muestran hoy en 4 lugares del sitio, todos vía el componente `ProductCard`:

- `/catalogo` — usa `getProducts()` (muestra **todos**).
- Home `/`, `/nosotros`, `/mision-vision` — vía `FeaturedProducts` → `getFeaturedProducts()` (featured = true).

Estado actual del modelo: la disponibilidad es un único booleano `available` que controla el badge (Disponible/No disponible), el color y si el botón de WhatsApp está activo.

## Objetivos

1. **Estados de producto**: reemplazar el booleano `available` por un conjunto de 6 estados con etiquetas y colores distintos, visibles al público.
2. **Visibilidad interna**: un switch visible/oculto (solo admin) que decide si el producto aparece o no en el sitio, sin borrarlo.
3. Corregir bugs del catálogo detectados durante la investigación (ver sección "Bugs incluidos").

## No-objetivos (fuera de alcance)

- Unificar los dos clientes Supabase (`src/lib/supabase.ts` module-level vs `@/lib/supabase/client`) que generan el warning "Multiple GoTrueClient instances". Se deja anotado; no bloquea nada.
- Gestión completa de categorías (CRUD). Solo se agrega autocompletado para evitar duplicados por typo.

## Fuente única de verdad: `src/lib/product-status.ts`

Un solo módulo define los estados. Todo el sitio y el admin leen de aquí; agregar/renombrar un estado a futuro es editar este archivo, sin tocar BD ni componentes.

```ts
export type ProductStatus =
  | 'disponible'
  | 'pocas_unidades'
  | 'proximamente'
  | 'en_camino'
  | 'agotado'
  | 'no_disponible';

export interface ProductStatusConfig {
  value: ProductStatus;
  label: string;          // etiqueta pública
  badgeClass: string;     // clases Tailwind del badge
  contactEnabled: boolean;// ¿botón WhatsApp activo?
}

export const DEFAULT_STATUS: ProductStatus = 'disponible';
```

| valor | label (público) | badge (color) | contactEnabled |
|---|---|---|---|
| `disponible` | Disponible | verde (`bg-green-500`) | ✅ |
| `pocas_unidades` | Quedan pocas unidades | ámbar (`bg-amber-500`) | ✅ |
| `proximamente` | Próximamente | azul (`bg-blue-500`) | ✅ |
| `en_camino` | En camino | turquesa (`bg-teal-500`) | ✅ |
| `agotado` | Agotado | rojo (`bg-red-500`) | ❌ |
| `no_disponible` | No disponible | gris (`bg-gray-500`) | ❌ |

Se exporta además un lookup seguro `getStatusConfig(status: string | null): ProductStatusConfig` que hace fallback a `disponible` si el valor no existe (defensa ante datos inesperados).

## Base de datos (migración)

Estrategia **aditiva primero, destructiva al final**, aplicada vía Management API (no `db push`), siguiendo el flujo de deploy del proyecto.

Paso 1 — aditivo (seguro, reversible):
```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'disponible';
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true;

-- Poblar status desde el booleano existente
UPDATE products SET status = 'no_disponible' WHERE available = false;
UPDATE products SET status = 'disponible'   WHERE available = true;
-- is_visible queda true por default en todos (nada se oculta con el cambio)
```

Paso 2 — verificación: confirmar recuentos por `status` y que ningún registro quedó con `status` fuera del set.

Paso 3 — destructivo (tras verificar):
```sql
ALTER TABLE products DROP COLUMN IF EXISTS available;   -- ya migrada a status
ALTER TABLE products DROP COLUMN IF EXISTS condition;   -- columna muerta (bug #7)
```

Actualizar `src/types/supabase.ts` para reflejar el nuevo esquema (`status`, `is_visible`; quitar `available` y `condition`).

## Capa de datos: `src/lib/products.ts`

- Interfaz `Product`: quitar `available`; agregar `status: ProductStatus` e `is_visible: boolean`. Corregir tipos que hoy mienten sobre nulos (`image_url`, `description`, `quantity`, `units_per_pallet`) — alinear con la BD y manejar nulos con fallback (bug #3).
- `getProducts()` — **sin cambios** (devuelve todo; lo consumen el admin de productos y el calendario de contenido).
- `getFeaturedProducts()` — agregar `.eq('is_visible', true)`.
- **Nueva** `getPublicProducts()` — `.eq('is_visible', true)`, ordenada por `created_at desc`; la consume el catálogo público.
- `addProduct` / `updateProduct` — aceptar `status` e `is_visible` en el payload.

## Sitio público

- **ProductCard** (`src/components/ProductCard.tsx`):
  - Badge de estado desde `getStatusConfig(product.status)` (label + `badgeClass`) en vez del ternario `available`.
  - Migrar `<img>` → `next/image` (bug #4) con `fill` + `sizes`; fallback visual si `image_url` es nulo/vacío.
- **ProductModal** (`src/components/ProductModal.tsx`):
  - Badge de estado desde el config.
  - Botón WhatsApp: `disabled` y con texto alterno cuando `contactEnabled === false`; el resto igual.
- **Catálogo** (`src/app/catalogo/page.tsx`):
  - Consumir `getPublicProducts()` (oculta no-visibles).
  - **Arreglo pantalla en blanco (bug #1)**: sustituir `if (products.length === 0) return null;` por un estado vacío con header + mensaje.
  - **SSR (bug #5)**: convertir la página a server component que hace `await getPublicProducts()` y renderiza un hijo cliente (`CatalogClient`) que mantiene el estado del filtro de categorías. Mejora SEO y elimina el parpadeo "Cargando…".
- **FeaturedProducts** (`src/components/home/FeaturedProducts.tsx`):
  - Mismo patrón SSR (server component que trae datos + render de `ProductCard`); ya filtra visibles vía `getFeaturedProducts()`.

## Admin — edición (`src/app/admin/productos/page.tsx`)

- **Formulario** (`FormData` y JSX): reemplazar la casilla "Disponible para venta" por:
  - **Selector de Estado**: un `Select` (dropdown) con los 6 estados; cada opción muestra su etiqueta pública, default `disponible`. Se elige `Select` sobre radio-cards porque 6 opciones mutuamente excluyentes caben mejor en un dropdown que en tarjetas.
  - **Switch de Visibilidad**: Visible / Oculto, con nota "Interno: si está oculto, no aparece en el sitio".
  - `EMPTY_FORM`: `status: 'disponible'`, `is_visible: true`.
  - `startEdit`: cargar `status` e `is_visible` del producto.
- **Vista grid y vista tabla**: el badge muestra el estado real (color del config). Reemplazar el `Switch`/badge de "Disponible" por: badge de estado (solo lectura en el listado) + un switch de visibilidad (Visible/Oculto). Renombrar la lógica `toggleAvailability` → `toggleVisibility`. El **cambio de estado se hace desde el formulario de edición**, no inline, para mantener el listado simple; el único toggle rápido en el listado es la visibilidad.
- **Categoría (bug #6)**: agregar `<datalist>` con las categorías existentes al input de categoría para autocompletar y evitar duplicados por typo.

## Bugs incluidos

1. Catálogo en blanco cuando no hay productos (`return null`) → estado vacío.
3. Tipos que mienten sobre nulos → tipos honestos + fallback de imagen.
4. `<img>` plano en la grilla → `next/image`.
5. Carga client-side del catálogo/destacados → server components (SEO, sin parpadeo).
6. Categoría texto libre → autocompletado con `datalist`.
7. Columna muerta `condition` → eliminada en la migración.

(#2 "sin control de visibilidad" es la feature principal.)

## Interacción entre campos

`status` e `is_visible` son **ortogonales**: un producto puede estar `disponible` pero oculto (mientras se prepara), o `agotado` y visible. `featured` sigue siendo independiente, pero un producto oculto (`is_visible=false`) no aparece en destacados porque `getFeaturedProducts()` filtra por visibilidad.

## Plan de verificación

- Migración: recuento por `status` antes/después; confirmar 0 filas con `status` inválido; confirmar que `available`/`condition` se eliminaron.
- `tsc --noEmit` limpio tras el cambio de tipos.
- Público: producto oculto no aparece en catálogo ni destacados; cada estado muestra su etiqueta/color; WhatsApp deshabilitado solo en `agotado`/`no_disponible`.
- Catálogo vacío: muestra estado vacío, no pantalla en blanco.
- Admin: crear/editar setea `status` + `is_visible`; toggles del listado persisten.

## Orden de implementación sugerido

1. `product-status.ts` (config).
2. Migración aditiva + poblar + verificar; actualizar `types/supabase.ts` y `Product`.
3. Capa de datos (`getPublicProducts`, filtros, tipos).
4. Admin (formulario + listados + datalist).
5. Sitio público (ProductCard, Modal, catálogo SSR + estado vacío, FeaturedProducts SSR).
6. Migración destructiva (drop `available`, `condition`) tras verificar que el código nuevo ya no los usa.
