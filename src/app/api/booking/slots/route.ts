import { NextResponse } from "next/server";

import {
  BOOKING_CALENDAR_ID,
  BUFFER_MIN,
  MIN_LEAD_TIME_MIN,
  SLOT_DURATION_MIN,
} from "@/lib/booking/config";
import { getGhlAuth, listCalendarEvents } from "@/lib/booking/ghl";
import {
  addMinutes,
  generateDaySlots,
  parseIsoDate,
  slotConflictsWithEvent,
} from "@/lib/booking/time";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Falta parámetro 'date'" }, { status: 400 });
  }
  const parsed = parseIsoDate(date);
  if (!parsed) {
    return NextResponse.json({ error: "Formato de fecha inválido" }, { status: 400 });
  }

  const auth = getGhlAuth();
  if (!auth) {
    return NextResponse.json({ error: "Servidor mal configurado" }, { status: 500 });
  }

  // Generamos los slots candidatos para ese día (instantes UTC)
  const candidates = generateDaySlots(parsed.year, parsed.month, parsed.day);
  if (candidates.length === 0) {
    return NextResponse.json({ slots: [] });
  }

  // Ventana de eventos a consultar: desde el primer slot menos buffer
  // hasta el último slot + duración + buffer
  const windowStart = addMinutes(candidates[0], -BUFFER_MIN);
  const windowEnd = addMinutes(
    candidates[candidates.length - 1],
    SLOT_DURATION_MIN + BUFFER_MIN,
  );

  let events: Array<{ startTime: string; endTime: string }> = [];
  try {
    events = await listCalendarEvents({
      token: auth.token,
      locationId: auth.locationId,
      calendarId: BOOKING_CALENDAR_ID,
      startMs: windowStart.getTime(),
      endMs: windowEnd.getTime(),
    });
  } catch (err) {
    // Si falla el fetch a GHL, no exponemos slots — preferimos error a sobre-reservar
    console.error("listCalendarEvents failed", err);
    return NextResponse.json(
      { error: "No pudimos consultar la disponibilidad. Intenta de nuevo." },
      { status: 502 },
    );
  }

  const parsedEvents = events
    .map((e) => ({
      start: new Date(e.startTime),
      end: new Date(e.endTime),
    }))
    .filter((e) => !isNaN(e.start.getTime()) && !isNaN(e.end.getTime()));

  const nowMs = Date.now();
  const minBookableMs = nowMs + MIN_LEAD_TIME_MIN * 60 * 1000;

  const slots = candidates.map((start) => {
    const end = addMinutes(start, SLOT_DURATION_MIN);

    // 1) descartamos slots en el pasado / con muy poca anticipación
    if (start.getTime() < minBookableMs) {
      return { startIso: start.toISOString(), endIso: end.toISOString(), available: false };
    }

    // 2) descartamos si choca con algún evento (respetando buffer)
    const conflict = parsedEvents.some((ev) =>
      slotConflictsWithEvent(start, end, ev.start, ev.end, BUFFER_MIN),
    );

    return {
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      available: !conflict,
    };
  });

  return NextResponse.json({
    date,
    durationMin: SLOT_DURATION_MIN,
    slots,
  });
}
