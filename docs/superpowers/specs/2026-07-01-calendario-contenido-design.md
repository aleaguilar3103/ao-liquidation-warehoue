# Calendario de Contenido — Diseño

**Fecha:** 2026-07-01
**Estado:** Aprobado (fase diseño)

## Objetivo

Añadir al panel de administración un **calendario mensual de contenido** para planear
qué se va a publicar en redes (Instagram y Facebook) y llevar el seguimiento de cada
pieza desde la idea hasta que sale publicada/pauteada.

Fase 1 (esta): construir la herramienta y su diseño, verla funcionando en local, aprobar el look.
Fase 2 (después): cargar el contenido real del plan mensual.

## Ubicación y navegación

- Nueva página **`/admin/contenido`**, hermana de `/admin/productos`.
- Un componente de navegación compartido (`AdminNav`) con dos pestañas/píldoras:
  **Productos** y **Calendario de Contenido**, resaltando la activa. Se muestra en ambas páginas.
- Mismo estilo visual, colores de marca y componentes shadcn/ui que el panel actual.

## Modelo de datos — tabla `content_plan` (Supabase)

Sin RLS, igual que la tabla `products` (se escribe con la anon key desde el panel).

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `scheduled_date` | date | Día planeado en el calendario |
| `channel` | text | `instagram` \| `facebook` \| `ambos` |
| `format` | text | `reel` \| `post` \| `historia` |
| `title` | text | Nombre corto / gancho de la idea |
| `copy` | text | Texto/caption del post (contenido real) |
| `status` | text | `nuevo` \| `produccion` \| `publicado` \| `pautado` |
| `notes` | text | Notas opcionales (guion, referencia) |
| `product_id` | uuid FK→products | Producto destacado (opcional) |
| `created_at` / `updated_at` | timestamptz | |

Capa de datos `src/lib/content.ts` con `getContent`, `addContent`, `updateContent`,
`deleteContent`, calcada de `src/lib/products.ts`.

### Estados (workflow)

1. **Nuevo** — idea registrada (gris)
2. **En producción** — grabando/editando (ámbar)
3. **Publicado** — ya salió (verde)
4. **Pautado** — además corre como anuncio pagado (violeta) — opcional/final

### Canales (color de etiqueta)

- **Instagram** — rosa/fucsia
- **Facebook** — azul
- **Ambos** — morado

## Vistas e interacción

- **Vista Mes (principal):** cuadrícula del mes, chips por día coloreados por canal con
  indicador de estado. Navegación ◀ ▶ entre meses + botón "Hoy". Clic en día vacío = crear
  contenido en esa fecha; clic en chip = editar.
- **Vista Lista:** tabla filtrable (mes/canal/estado).
- **Tarjetas de resumen:** total del mes, en producción, publicados, pautados.
- **Filtros:** por canal y por estado.
- **Formulario en modal** (`Dialog`) con los campos de la tabla; borrar vía `AlertDialog`
  de confirmación (mismo patrón que productos).

## Fase diseño → contenido real (fallback de ejemplo)

Para poder **verlo funcionando en local de inmediato**, aunque la tabla `content_plan`
todavía no exista en Supabase:

- `getContent()` devuelve `{ items, isExample }`.
- Si Supabase no está configurado **o** la tabla no existe (error al leer) →
  se muestran **datos de ejemplo** del mes actual con un banner "Datos de ejemplo —
  los cambios no se guardan". En este modo, crear/editar/borrar solo modifica el estado
  local (para poder "jugar" con el diseño).
- Cuando la tabla exista → usa datos reales y persiste normalmente.

Al aprobar el diseño: aplicar la migración y cargar el contenido real.

## Archivos

- `supabase/migrations/20260701000001_create_content_plan_table.sql` (nuevo)
- `src/lib/content.ts` (nuevo)
- `src/components/admin/AdminNav.tsx` (nuevo)
- `src/app/admin/contenido/page.tsx` (nuevo)
- `src/app/admin/productos/page.tsx` (editar: añadir `AdminNav`)
