import { NextResponse } from "next/server";

import {
  BOOKING_CALENDAR_ID,
  BUFFER_MIN,
  GHL_CUSTOM_FIELD_IDS,
  SLOT_DURATION_MIN,
} from "@/lib/booking/config";
import {
  buildBookingEmailHtml,
  buildBookingEmailSubject,
} from "@/lib/booking/email";
import {
  addContactNote,
  createAppointment,
  getGhlAuth,
  listCalendarEvents,
  sendEmailToContact,
  upsertContact,
} from "@/lib/booking/ghl";
import { slotConflictsWithEvent } from "@/lib/booking/time";

export const dynamic = "force-dynamic";

type BookingPayload = {
  name?: string;
  email?: string;
  phone?: string;
  business?: string;
  businessType?: string;
  categories?: string[];
  message?: string;
  startIso?: string;
};

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

// Arma el array de custom fields para GHL. Solo incluye los campos cuyo key
// ya esté configurado en GHL_CUSTOM_FIELD_KEYS y que tengan valor.
function buildCustomFields(
  payload: BookingPayload,
): Array<{ id: string; field_value: string | string[] }> {
  const out: Array<{ id: string; field_value: string | string[] }> = [];

  if (GHL_CUSTOM_FIELD_IDS.business && payload.business?.trim()) {
    out.push({ id: GHL_CUSTOM_FIELD_IDS.business, field_value: payload.business.trim() });
  }
  if (GHL_CUSTOM_FIELD_IDS.businessType && payload.businessType?.trim()) {
    out.push({ id: GHL_CUSTOM_FIELD_IDS.businessType, field_value: payload.businessType.trim() });
  }
  if (GHL_CUSTOM_FIELD_IDS.categories && payload.categories && payload.categories.length > 0) {
    // Multiple Options en GHL espera un array de valores
    out.push({ id: GHL_CUSTOM_FIELD_IDS.categories, field_value: payload.categories });
  }
  if (GHL_CUSTOM_FIELD_IDS.message && payload.message?.trim()) {
    out.push({ id: GHL_CUSTOM_FIELD_IDS.message, field_value: payload.message.trim() });
  }

  return out;
}

function buildNoteBody(payload: BookingPayload): string {
  const lines = [
    "Solicitud de valoración desde el sitio web.",
    "",
    `Negocio / Empresa: ${payload.business?.trim() || "—"}`,
    `Tipo de negocio: ${payload.businessType?.trim() || "—"}`,
    `Categorías de interés: ${
      payload.categories && payload.categories.length > 0
        ? payload.categories.join(", ")
        : "—"
    }`,
    "",
    "Mensaje:",
    payload.message?.trim() ? payload.message.trim() : "(sin mensaje)",
  ];
  return lines.join("\n");
}

export async function POST(request: Request) {
  const auth = getGhlAuth();
  if (!auth) {
    return NextResponse.json({ error: "Servidor mal configurado" }, { status: 500 });
  }

  let payload: BookingPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const name = payload.name?.trim() ?? "";
  const email = payload.email?.trim() ?? "";
  const phone = payload.phone?.trim() ?? "";
  const startIso = payload.startIso?.trim() ?? "";

  if (!name || !email || !phone || !startIso) {
    return NextResponse.json(
      { error: "Nombre, correo, teléfono y horario son requeridos" },
      { status: 400 },
    );
  }

  const start = new Date(startIso);
  if (isNaN(start.getTime())) {
    return NextResponse.json({ error: "Horario inválido" }, { status: 400 });
  }
  const end = new Date(start.getTime() + SLOT_DURATION_MIN * 60 * 1000);

  if (start.getTime() < Date.now()) {
    return NextResponse.json({ error: "El horario seleccionado ya pasó" }, { status: 400 });
  }

  // Re-verificamos disponibilidad para evitar dobles reservas
  try {
    const events = await listCalendarEvents({
      token: auth.token,
      locationId: auth.locationId,
      calendarId: BOOKING_CALENDAR_ID,
      startMs: start.getTime() - BUFFER_MIN * 60 * 1000,
      endMs: end.getTime() + BUFFER_MIN * 60 * 1000,
    });

    const conflict = events.some((e) => {
      const evStart = new Date(e.startTime);
      const evEnd = new Date(e.endTime);
      if (isNaN(evStart.getTime()) || isNaN(evEnd.getTime())) return false;
      return slotConflictsWithEvent(start, end, evStart, evEnd, BUFFER_MIN);
    });

    if (conflict) {
      return NextResponse.json(
        { error: "Ese horario acaba de ocuparse. Elige otro, por favor." },
        { status: 409 },
      );
    }
  } catch (err) {
    console.error("availability re-check failed", err);
    return NextResponse.json(
      { error: "No pudimos validar la disponibilidad. Intenta de nuevo." },
      { status: 502 },
    );
  }

  const { firstName, lastName } = splitName(name);
  const customFields = buildCustomFields(payload);

  // 1) Upsert contacto
  let contactId: string | null;
  try {
    contactId = await upsertContact({
      token: auth.token,
      locationId: auth.locationId,
      firstName,
      lastName,
      email,
      phone,
      source: "Website - Valoración",
      tags: ["valoracion-web", "lead-web"],
      customFields: customFields.length > 0 ? customFields : undefined,
    });
  } catch (err) {
    console.error("upsertContact failed", err);
    return NextResponse.json(
      { error: "No pudimos guardar tu contacto. Intenta de nuevo." },
      { status: 502 },
    );
  }

  if (!contactId) {
    return NextResponse.json(
      { error: "No pudimos identificar tu contacto. Intenta de nuevo." },
      { status: 502 },
    );
  }

  // 2) Nota con detalles del negocio (no bloqueante)
  try {
    await addContactNote({
      token: auth.token,
      contactId,
      body: buildNoteBody(payload),
    });
  } catch (err) {
    console.error("addContactNote non-blocking error", err);
  }

  // 3) Crear cita
  try {
    const appointment = await createAppointment({
      token: auth.token,
      locationId: auth.locationId,
      calendarId: BOOKING_CALENDAR_ID,
      contactId,
      startTimeIso: start.toISOString(),
      endTimeIso: end.toISOString(),
      title: `Valoración — ${name}`,
    });

    // Email de confirmación (no bloquea la respuesta)
    try {
      await sendEmailToContact({
        token: auth.token,
        locationId: auth.locationId,
        contactId,
        subject: buildBookingEmailSubject(),
        html: buildBookingEmailHtml({
          firstName,
          startIso: start.toISOString(),
          endIso: end.toISOString(),
        }),
        emailFrom: "info@aoliquidationwarehouse.com",
      });
    } catch (err) {
      console.error("sendEmailToContact non-blocking error", err);
    }

    return NextResponse.json({
      ok: true,
      appointmentId: appointment.id,
      contactId,
      startIso: start.toISOString(),
      endIso: end.toISOString(),
    });
  } catch (err) {
    console.error("createAppointment failed", err);
    return NextResponse.json(
      { error: "No pudimos confirmar tu valoración. Te contactaremos pronto." },
      { status: 502 },
    );
  }
}
