// Cliente liviano para los endpoints de GoHighLevel que usa el flujo de booking.

const GHL_API_BASE = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-04-15"; // versión para Calendars API

export type GhlEvent = {
  id?: string;
  startTime: string; // ISO
  endTime: string;   // ISO
};

export function getGhlAuth(): { token: string; locationId: string } | null {
  const token = process.env.GHL_PIT_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) return null;
  return { token, locationId };
}

function ghlHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Version: GHL_API_VERSION,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

// Eventos del calendario en una ventana
export async function listCalendarEvents(args: {
  token: string;
  locationId: string;
  calendarId: string;
  startMs: number;
  endMs: number;
}): Promise<GhlEvent[]> {
  const url = new URL(`${GHL_API_BASE}/calendars/events`);
  url.searchParams.set("locationId", args.locationId);
  url.searchParams.set("calendarId", args.calendarId);
  url.searchParams.set("startTime", String(args.startMs));
  url.searchParams.set("endTime", String(args.endMs));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: ghlHeaders(args.token),
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GHL events fetch failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const events = (data?.events ?? []) as Array<Record<string, unknown>>;
  return events
    .map((e) => ({
      id: e.id as string | undefined,
      startTime: e.startTime as string,
      endTime: e.endTime as string,
    }))
    .filter((e) => e.startTime && e.endTime);
}

// Upsert de contacto (devuelve contactId)
export async function upsertContact(args: {
  token: string;
  locationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source?: string;
  tags?: string[];
  customFields?: Array<{ id: string; field_value: string | string[] }>;
}): Promise<string | null> {
  const res = await fetch(`${GHL_API_BASE}/contacts/upsert`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.token}`,
      Version: "2021-07-28",
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      locationId: args.locationId,
      firstName: args.firstName,
      lastName: args.lastName,
      name: `${args.firstName} ${args.lastName}`.trim(),
      email: args.email,
      phone: args.phone || undefined,
      source: args.source ?? "Website - Valoración",
      tags: args.tags ?? ["valoracion-web"],
      customFields: args.customFields,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GHL upsert contact failed (${res.status}): ${errText}`);
  }
  const data = await res.json();
  return (data?.contact?.id ?? data?.id ?? null) as string | null;
}

// Nota en el contacto (para guardar info del formulario)
export async function addContactNote(args: {
  token: string;
  contactId: string;
  body: string;
}): Promise<void> {
  const res = await fetch(
    `${GHL_API_BASE}/contacts/${args.contactId}/notes`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.token}`,
        Version: "2021-07-28",
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body: args.body }),
    },
  );
  if (!res.ok) {
    const errText = await res.text();
    console.error("GHL add note failed", res.status, errText);
  }
}

// Envía un email transaccional al contacto vía el endpoint de conversaciones de GHL.
// El "from" lo determina la configuración del location (info@aoliquidationwarehouse.com).
export async function sendEmailToContact(args: {
  token: string;
  locationId: string;
  contactId: string;
  subject: string;
  html: string;
  emailFrom?: string;
}): Promise<{ ok: true; messageId?: string }> {
  const res = await fetch(
    "https://services.leadconnectorhq.com/conversations/messages",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.token}`,
        Version: "2021-04-15",
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "Email",
        contactId: args.contactId,
        subject: args.subject,
        html: args.html,
        emailFrom: args.emailFrom,
      }),
    },
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GHL send email failed (${res.status}): ${errText}`);
  }
  const data = await res.json().catch(() => ({}));
  return {
    ok: true,
    messageId: (data?.messageId ?? data?.id) as string | undefined,
  };
}

// Crear appointment
export async function createAppointment(args: {
  token: string;
  locationId: string;
  calendarId: string;
  contactId: string;
  startTimeIso: string; // ISO con offset
  endTimeIso: string;
  title: string;
}): Promise<{ id: string }> {
  const res = await fetch(`${GHL_API_BASE}/calendars/events/appointments`, {
    method: "POST",
    headers: ghlHeaders(args.token),
    body: JSON.stringify({
      calendarId: args.calendarId,
      locationId: args.locationId,
      contactId: args.contactId,
      startTime: args.startTimeIso,
      endTime: args.endTimeIso,
      title: args.title,
      appointmentStatus: "confirmed",
      ignoreDateRange: false,
      toNotify: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GHL create appointment failed (${res.status}): ${errText}`);
  }
  const data = await res.json();
  const id = data?.id ?? data?.appointment?.id ?? "";
  return { id };
}
