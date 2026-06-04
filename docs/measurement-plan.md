# Measurement Plan — Landing de Valoración

Fuente de verdad del tracking de `/valoracion`, `/valoracion/agendar` y `/valoracion/confirmada`.

- **GTM Container:** `GTM-K57JCV73`
- **GA4 Measurement ID:** `G-VFZRMFQPFL`
- **Meta Pixel / Dataset ID:** `1550740939944513`
- **CAPI:** vía Adsmurai OneTag (Browser + Server deduplicado por `event_id`)

## Funnel

```
/valoracion          → landing (hero + CTAs)
/valoracion/agendar  → BookingWizard (8 pasos)   → push: valoracion_iniciada
/valoracion/confirmada → booking confirmado       → push: valoracion_agendada
```

## Eventos

| dataLayer event       | Cuándo dispara                                  | Trigger GTM              | GA4 event           | Meta event           |
|-----------------------|-------------------------------------------------|--------------------------|---------------------|----------------------|
| (page load)           | Toda página                                     | All Pages                | — (Google Tag base) | `PageView` (Adsmurai madre) |
| `valoracion_iniciada` | Al abrir el wizard, 1× por sesión               | CE — valoracion_iniciada | `begin_checkout`    | ❌ (funnel only)      |
| `valoracion_agendada` | Booking confirmado (después del success del API)| CE — valoracion_agendada | `appointment_booked`| `Schedule` (Adsmurai copia) |

**Tags Adsmurai:** 2 en total → `PageView` (madre, existente) + `Schedule` (1 copia, sobre `CE — valoracion_agendada`).

### Parámetros

| Evento                | Parámetro          | Origen                                  |
|-----------------------|--------------------|-----------------------------------------|
| `valoracion_agendada` | `valoracion_fecha` | ISO de la fecha/hora de la cita (start) |

## Reglas

- `valoracion_iniciada` **NO** va a Meta — es señal de funnel, ruido para el algoritmo de conversiones.
- `valoracion_agendada` → Meta `Schedule` (cita con fecha/hora concreta).
- Los pushes van **después** del éxito del API y con guard anti-duplicado (sessionStorage).

## Pendientes de verificar en GTM

1. Trigger **Valoración Agendada** = Evento personalizado, nombre exacto `valoracion_agendada`.
2. Tag **GA4 - Cita confirmada** = Event name `appointment_booked`.
