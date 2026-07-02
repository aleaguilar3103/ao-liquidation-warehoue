import { NextResponse } from "next/server";

const GHL_API_BASE = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export async function POST(request: Request) {
  const token = process.env.GHL_PIT_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!token || !locationId) {
    console.error("GHL env vars missing");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  let payload: ContactPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = payload.name?.trim() ?? "";
  const email = payload.email?.trim() ?? "";
  const phone = payload.phone?.trim() ?? "";
  const message = payload.message?.trim() ?? "";

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Nombre, correo y mensaje son requeridos" },
      { status: 400 }
    );
  }

  const { firstName, lastName } = splitName(name);

  const headers = {
    Authorization: `Bearer ${token}`,
    Version: GHL_API_VERSION,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const upsertRes = await fetch(`${GHL_API_BASE}/contacts/upsert`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      locationId,
      firstName,
      lastName,
      name,
      email,
      phone: phone || undefined,
      source: "Website Contact Form",
      tags: ["website-form", "contacto-web"],
    }),
  });

  if (!upsertRes.ok) {
    const errText = await upsertRes.text();
    console.error("GHL upsert failed", upsertRes.status, errText);
    return NextResponse.json(
      { error: "No se pudo guardar el contacto" },
      { status: 502 }
    );
  }

  const upsertData = await upsertRes.json();
  const contactId: string | undefined =
    upsertData?.contact?.id ?? upsertData?.id;

  if (contactId) {
    const noteRes = await fetch(
      `${GHL_API_BASE}/contacts/${contactId}/notes`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ body: `Mensaje del formulario web:\n\n${message}` }),
      }
    );
    if (!noteRes.ok) {
      console.error("GHL note failed", noteRes.status, await noteRes.text());
    }
  }

  return NextResponse.json({ ok: true, contactId });
}
