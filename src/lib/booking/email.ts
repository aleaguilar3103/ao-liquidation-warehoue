// Template HTML del correo de confirmación de valoración.
// Estilo inline + tablas porque clientes de email son hostiles con CSS moderno.

import { utcToCrShifted } from "./time";

const BRAND = "#0F233F";
const BRAND_DARK = "#0A1829";
const ACCENT = "#FBBF24";
const TEXT = "#1F2937";
const MUTED = "#6B7280";
const BG = "#F8FAFC";
const CARD_BORDER = "#E5E7EB";

const LOGO_URL =
  "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/68f6739418c4202b283f9ef9.png";

function formatLongDateEs(d: Date): string {
  // d ya viene desplazado a CR (los campos UTC son la hora CR)
  const dia = d.toLocaleDateString("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)}`;
}

function formatCrTime(d: Date): string {
  const h24 = d.getUTCHours();
  const m = d.getUTCMinutes();
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export type BookingEmailData = {
  firstName: string;
  startIso: string;
  endIso: string;
};

export function buildBookingEmailSubject(): string {
  return "¡Tu valoración con AO Liquidation Warehouse está confirmada!";
}

export function buildBookingEmailHtml(data: BookingEmailData): string {
  const startUtc = new Date(data.startIso);
  const endUtc = new Date(data.endIso);
  const startCr = utcToCrShifted(startUtc);
  const endCr = utcToCrShifted(endUtc);

  const dateLabel = formatLongDateEs(startCr);
  const timeLabel = `${formatCrTime(startCr)} – ${formatCrTime(endCr)} (hora Costa Rica)`;
  const firstName = data.firstName?.trim() || "Hola";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tu valoración está confirmada</title>
</head>
<body style="margin:0;padding:0;background-color:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${TEXT};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${BG};">
    Tu valoración con AO Liquidation Warehouse está confirmada para ${dateLabel} a las ${formatCrTime(startCr)}.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${BG};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,35,63,0.08);">

          <!-- Header con gradiente brand -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND} 0%,${BRAND_DARK} 100%);padding:36px 32px;text-align:center;">
              <img src="${LOGO_URL}" alt="AO Liquidation Warehouse" width="160" style="display:inline-block;max-width:160px;height:auto;margin-bottom:18px;" />
              <div style="color:#FFFFFF;font-size:13px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;opacity:0.85;">
                Valoración confirmada
              </div>
              <h1 style="color:#FFFFFF;font-size:28px;line-height:1.25;margin:8px 0 0;font-weight:700;">
                ¡Listo, ${firstName}! Te esperamos.
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 12px;">
              <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:${TEXT};">
                Gracias por reservar tu valoración con AO Liquidation Warehouse. Un agente te va a contactar
                en el horario que elegiste para conocer tu negocio y mostrarte qué programa de pallets calza
                mejor con lo que estás vendiendo hoy.
              </p>

              <!-- Tarjeta con los detalles -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;border:2px solid ${BRAND}15;border-radius:14px;background-color:#FAFBFD;">
                <tr>
                  <td style="padding:24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-bottom:18px;">
                          <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin-bottom:4px;">
                            Fecha
                          </div>
                          <div style="font-size:17px;font-weight:700;color:${BRAND};">
                            ${dateLabel}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:18px;border-top:1px solid ${CARD_BORDER};padding-top:18px;">
                          <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin-bottom:4px;">
                            Hora
                          </div>
                          <div style="font-size:17px;font-weight:700;color:${BRAND};">
                            ${timeLabel}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="border-top:1px solid ${CARD_BORDER};padding-top:18px;">
                          <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin-bottom:4px;">
                            Duración
                          </div>
                          <div style="font-size:17px;font-weight:700;color:${BRAND};">
                            10 a 15 minutos · Llamada con un agente
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Qué esperar -->
              <div style="margin:28px 0 8px;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${BRAND};">
                Qué esperar
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 18px;">
                <tr>
                  <td style="padding:8px 0;font-size:15px;line-height:1.6;color:${TEXT};">
                    <span style="display:inline-block;width:24px;color:${ACCENT};font-weight:700;">→</span>
                    Un agente humano te llama en el horario reservado.
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:15px;line-height:1.6;color:${TEXT};">
                    <span style="display:inline-block;width:24px;color:${ACCENT};font-weight:700;">→</span>
                    Vamos a entender tu modelo de negocio y los productos que querés mover.
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:15px;line-height:1.6;color:${TEXT};">
                    <span style="display:inline-block;width:24px;color:${ACCENT};font-weight:700;">→</span>
                    Si los programas calzan, el agente coordina contigo los siguientes pasos.
                  </td>
                </tr>
              </table>

              <!-- WhatsApp CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 12px;">
                <tr>
                  <td align="center">
                    <a href="https://wa.link/zvmnhy" target="_blank"
                       style="display:inline-block;background:linear-gradient(135deg,${BRAND} 0%,${BRAND_DARK} 100%);color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;">
                      Escribinos por WhatsApp
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:${MUTED};text-align:center;">
                ¿Necesitás reagendar o cancelar? Escribinos por WhatsApp al
                <a href="https://wa.link/zvmnhy" style="color:${BRAND};font-weight:600;text-decoration:none;">+506 7191 0009</a>
                y te ayudamos.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${BRAND_DARK};padding:24px 32px;text-align:center;">
              <div style="color:#FFFFFF;font-size:14px;font-weight:700;margin-bottom:6px;">
                AO Liquidation Warehouse
              </div>
              <div style="color:#FFFFFF;opacity:0.7;font-size:12px;line-height:1.6;">
                Tu proveedor oficial de mercancía de liquidación premium en Costa Rica.
              </div>
              <div style="margin-top:14px;color:#FFFFFF;opacity:0.55;font-size:11px;">
                © ${new Date().getUTCFullYear()} AO Liquidation Warehouse · San José, Costa Rica
              </div>
            </td>
          </tr>
        </table>

        <div style="max-width:600px;margin-top:18px;color:${MUTED};font-size:11px;text-align:center;line-height:1.5;">
          Recibís este correo porque reservaste una valoración en
          aoliquidationwarehouse.com.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
