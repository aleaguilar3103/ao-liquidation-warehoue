# Sistema de Seguimiento de Leads — GoHighLevel

**AO Liquidation Warehouse** · Guía de configuración e instructivo de uso
_Preparado: 1 de julio, 2026_

---

## 1. El problema que resolvemos

Hoy tenemos **358 leads cualificados** (etiqueta `valoracion-web`) que costaron ~$0.84 cada uno. Pero el seguimiento se hace **por llamada telefónica sin registrarse en el CRM**, así que:

- ❌ No sabemos a cuántos se contactó con éxito.
- ❌ No sabemos cuántos están en seguimiento activo.
- ❌ No sabemos cuántos siguen **sin contactar**.
- ✅ Lo único que existe hoy es la etiqueta `no contestó` (en 153 contactos).

**Objetivo:** darle a cada lead una trazabilidad clara y obtener métricas automáticas del embudo de seguimiento.

> ⚠️ **Nota técnica sobre la API:** Las herramientas de API/MCP disponibles solo permiten **aplicar etiquetas a contactos existentes** y actualizar oportunidades. **No** permiten crear pipelines, etapas, definiciones de etiquetas ni automatizaciones (workflows). Por eso el pipeline y las automatizaciones deben crearse desde la **interfaz de GHL** siguiendo esta guía. Las etiquetas sí se pueden sembrar vía API (ver sección 6).

---

## 2. El sistema (recomendado: híbrido)

Dos capas que trabajan juntas:

1. **Pipeline de Oportunidades** → es la **fuente de verdad** del estado de cada lead. Da el dashboard/métrica por etapa que el cliente quiere ver.
2. **Etiquetas (tags)** → para filtrar y segmentar rápido, y para disparar automatizaciones.

---

## 3. Pipeline: "Seguimiento de Leads"

Crear un pipeline nuevo con estas **8 etapas** (en orden):

| # | Etapa | Qué significa |
|---|-------|---------------|
| 1 | 🆕 **Nuevo lead (sin contactar)** | Entró por campaña, nadie lo ha llamado todavía. |
| 2 | 📞 **Llamado · No contestó** | Se intentó llamar, no hubo respuesta. |
| 3 | 🔁 **Seguimiento 1** | Se logró contacto; primera conversación. |
| 4 | 🔁 **Seguimiento 2** | Segundo contacto de seguimiento. |
| 5 | 🔁 **Seguimiento 3** | Tercer y último contacto de seguimiento. |
| 6 | 🔥 **Interesado / Cotizando** | Mostró interés real, se está negociando. |
| 7 | ❌ **No colaboró** | Tras 3 intentos / 3 días sin avanzar, se descarta. |
| 8 | 🏆 **Cliente ganado** | Compró / se convirtió. |

**Regla de oro:** después de **cada** llamada, el agente **arrastra la tarjeta** a la etapa que corresponde. Eso es lo que genera la métrica.

---

## 4. Etiquetas (tags)

Etiquetas de **estado** (complementan el pipeline y disparan automatizaciones):

| Etiqueta | Cuándo se aplica |
|----------|------------------|
| `sin-contactar` | Al entrar el lead (estado inicial). |
| `llamado` | Se realizó al menos una llamada. |
| `no-contesto` | Llamada sin respuesta _(ya existe como “no contestó”)_. |
| `contactado` | Se habló con el lead. |
| `seguimiento-1` / `seguimiento-2` / `seguimiento-3` | Según el número de contacto de seguimiento. |
| `interesado` | Mostró interés de compra. |
| `no-colaboro` | Se descartó tras 3 intentos. |
| `cliente-ganado` | Se convirtió en cliente. |

> Las etiquetas de **canal/origen** ya existen y se conservan: `valoracion-web`, `fb-ad-lead-whatsapp`, `campaña wpp`, etc. No las tocamos.

---

## 5. Automatizaciones (Workflows) recomendadas

Configurar en **Automation → Workflows**:

1. **Alta de lead nuevo**
   `Trigger:` contacto recibe etiqueta `valoracion-web` (o `fb-ad-lead-whatsapp`)
   `Acciones:` crear Oportunidad en etapa **Nuevo lead** · aplicar tag `sin-contactar` · crear **tarea "Llamar al lead"** (vence hoy) · notificar al agente.

2. **Ciclo de re-intentos (no contestó)**
   `Trigger:` la oportunidad entra a **Llamado · No contestó**
   `Acciones:` crear tarea "Reintentar llamada" en +1 día · después de **3 intentos en 3 días** sin avanzar → mover a **No colaboró** + tag `no-colaboro`.

3. **Cadencia de seguimiento**
   `Trigger:` la oportunidad entra a **Seguimiento 1 / 2 / 3**
   `Acciones:` programar la siguiente tarea de seguimiento en +2/+3 días · aplicar tag `seguimiento-N`.

4. **Regla de los 3 días (limpieza)**
   `Trigger:` oportunidad sin actividad por 3 días en etapas de seguimiento
   `Acciones:` mover a **No colaboró** + tag `no-colaboro` + notificar.

---

## 6. El punto crítico: que el equipo lo USE

El mejor pipeline no sirve si las llamadas no se registran. Opciones (de mejor a mínima):

- ✅ **Ideal — Llamar desde GHL:** que la persona use el botón **"Call"** (click-to-call) dentro del contacto o la **app móvil de GHL**. La llamada se registra sola y queda el historial.
- ✅ **Aceptable — Etiquetar tras cada llamada:** si sigue llamando desde su teléfono, que **inmediatamente después** entre al contacto y mueva la tarjeta de etapa / aplique la etiqueta de resultado.
- 📋 **Control diario:** revisar cada mañana la etapa **Nuevo lead** para que ningún prospecto se quede sin contactar.

Hacer de esto un paso **no negociable** del proceso de la persona que llama.

---

## 7. Pasos para configurarlo en GHL (interfaz)

1. **Pipeline:** `Ajustes → Pipelines → + Add Pipeline` → nombrar "Seguimiento de Leads" → agregar las 8 etapas de la sección 3 en orden.
2. **Etiquetas:** `Contactos → Tags → + Add Tag` → crear las etiquetas de la sección 4 (o se crean solas al aplicarlas por primera vez).
3. **Workflows:** `Automation → Workflows → + Create Workflow` → armar las 4 automatizaciones de la sección 5.
4. **Sembrar el estado inicial:** aplicar `sin-contactar` a los 358 leads actuales y crearles la oportunidad en etapa **Nuevo lead** (ver sección 6 / puedo ayudar vía API con las etiquetas).
5. **Capacitar** a la persona que llama en la regla de la sección 6.

---

## 8. Qué métrica obtienes al final

Una vez en marcha, el dashboard del pipeline responde de un vistazo:

- Cuántos leads **sin contactar** (pendientes).
- Cuántos **contactados** vs. **no contestó**.
- Cuántos en **seguimiento activo** (1/2/3).
- Cuántos **interesados**, **ganados** y **descartados**.
- **Tasa de conversión** por etapa y tiempo promedio en cada una.

Justamente la métrica que hoy aparece **vacía** en el reporte al cliente (sección 4 del HTML).
