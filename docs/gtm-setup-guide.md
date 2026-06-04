# GTM Setup Guide — Landing de Valoración

Container: `GTM-K57JCV73` · GA4: `G-VFZRMFQPFL` · Meta Pixel: `1550740939944513`

Config limpia: GA4 (base + 2 eventos) viene del JSON; las conversiones de Meta
se hacen duplicando tu tag Adsmurai existente.

---

## 1. Borrar las tags viejas

En GTM → Etiquetas, borrá estas **3**:

- ❌ `Etiqueta GA4` (la reemplaza `Google Tag — GA4 base` del JSON)
- ❌ `GA4 - Cita confirmada` (la reemplaza `GA4 — appointment_booked`)
- ❌ `Meta - Cita confirmada` (la reemplazás con un duplicado limpio de Adsmurai — paso 4)

**Conservá:**
- ✅ `Meta API Conversions / AdsMurai` → es tu **tag madre** de Adsmurai (PageView). De acá duplicás.

El trigger viejo `Valoración Agendada` podés borrarlo: el JSON trae `CE — valoracion_agendada` limpio.

---

## 2. Importar el JSON

GTM → **Admin** → **Import Container** → `docs/gtm-container.json`:

- Workspace: **Existing**
- Import option: **Merge** → **Overwrite conflicting tags, triggers, and variables**

Agrega:

| Elemento | Tipo | Dispara en |
|---|---|---|
| `Google Tag — GA4 base` | Google Tag | All Pages |
| `GA4 — begin_checkout (valoración)` | GA4 Event | `CE — valoracion_iniciada` |
| `GA4 — appointment_booked (valoración)` | GA4 Event | `CE — valoracion_agendada` |
| `CE — valoracion_iniciada` | Trigger evento personalizado | — |
| `CE — valoracion_agendada` | Trigger evento personalizado | — |
| `Const - GA4 Measurement ID` | Constante (`G-VFZRMFQPFL`) | — |
| `DLV - valoracion_fecha` | Variable de dataLayer | — |

---

## 3. ¿Cuántas copias de Adsmurai? → **1 copia**

Meta solo recibe eventos **con valor de conversión**. En este funnel son 2:

| Evento Meta | Tag | Estado |
|---|---|---|
| `PageView` | `Meta API Conversions / AdsMurai` | ✅ Ya existe (tag madre) — no la toques |
| `Schedule` | nueva copia (paso 4) | 🆕 Hacer 1 duplicado |

`begin_checkout` / inicio del wizard **NO** va a Meta (es ruido para el algoritmo).
Total: **2 tags Adsmurai** (la madre + 1 copia).

---

## 4. Crear la copia de Adsmurai (Schedule)

1. En la tag `Meta API Conversions / AdsMurai` → clic en ⋮ → **Duplicar**.
2. Renombrá a: `Adsmurai | Schedule (valoración)`.
3. Cambiá el **Event name**: `PageView` → **`Schedule`**.
4. Cambiá el **Activador**: All Pages → **`CE — valoracion_agendada`**.
5. **Fire method**: Both pixel for web & Conversions API (igual que la madre).
6. Guardar. **No toques la tag madre PageView.**

### Qué data lleva cada tag Adsmurai

| Tag | Event name | Activador | Datos que envía |
|---|---|---|---|
| `Meta API Conversions / AdsMurai` | `PageView` | All Pages | Estándar de página (url, user agent, ip, fbp/fbc). `event_id` auto para dedup. |
| `Adsmurai \| Schedule (valoración)` | `Schedule` | `CE — valoracion_agendada` | Lo mismo + `event_id` auto. **Sin valor monetario** (es una cita, no compra). |

> **Dedup:** Adsmurai genera y comparte el mismo `event_id` entre Browser y Server
> automáticamente. No tenés que setear nada para eso.

### (Opcional, recomendado) Subir el Event Match Quality del CAPI

Para que el CAPI matchee mejor al usuario, conviene mandarle email/teléfono.
Hoy el push `valoracion_agendada` solo lleva `valoracion_fecha`. Si querés,
agregamos `user_data` (email, teléfono, nombre) al push y los mapeás en el
**Advanced Matching** de Adsmurai. Avisame y lo cableo en el código.

---

## 5. Validar (Vista Previa)

1. GTM → **Vista Previa** → recorré `/valoracion` → wizard → confirmar.
2. Tag Assistant:
   - Al abrir wizard → `GA4 — begin_checkout` dispara.
   - Al confirmar → `GA4 — appointment_booked` + `Adsmurai | Schedule` disparan.
3. **GA4 DebugView**: `begin_checkout` y `appointment_booked` (con `valoracion_fecha`).
4. **Meta Test Events** (con `test_event_code` temporal en las tags Adsmurai):
   `Schedule` con badge **Navegador + Servidor + Deduplicado** (mismo `event_id`).

---

## 6. Publicar

1. Borrá los `test_event_code` temporales de las tags Adsmurai.
2. GTM → **Enviar** → nombrá la versión → **Publicar**.

---

## Checklist

- [ ] Borradas: `Etiqueta GA4`, `GA4 - Cita confirmada`, `Meta - Cita confirmada`
- [ ] JSON importado (overwrite)
- [ ] Duplicado `Adsmurai | Schedule (valoración)` creado (event `Schedule`, trigger `CE — valoracion_agendada`)
- [ ] Código deployado (push `valoracion_iniciada` en BookingWizard)
- [ ] `begin_checkout` + `appointment_booked` en GA4 DebugView
- [ ] `Schedule` deduplicado en Meta Test Events
- [ ] `test_event_code` borrado
- [ ] Versión publicada
