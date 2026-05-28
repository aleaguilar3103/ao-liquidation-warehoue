// Helpers de tiempo. Trabajamos siempre con instantes UTC para evitar drift,
// y convertimos a/desde hora Costa Rica (UTC-6 fijo) cuando necesitamos
// presentar o generar slots.

import {
  CR_UTC_OFFSET_HOURS,
  SLOT_DURATION_MIN,
  SLOT_STEP_MIN,
  WORK_END_HOUR,
  WORK_START_HOUR,
} from "./config";

const HOUR_MS = 3600 * 1000;
const MIN_MS = 60 * 1000;

// Construye un Date (instante UTC) a partir de fecha+hora local de Costa Rica.
export function crLocalToUtc(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
): Date {
  // CR = UTC-6 → para convertir CR→UTC sumamos 6 horas
  return new Date(
    Date.UTC(year, month - 1, day, hour - CR_UTC_OFFSET_HOURS, minute, 0, 0),
  );
}

// Devuelve un Date "desplazado" que representa la hora local de CR en sus campos UTC.
// Útil para hacer .getUTCHours() y obtener "la hora en CR".
export function utcToCrShifted(d: Date): Date {
  return new Date(d.getTime() + CR_UTC_OFFSET_HOURS * HOUR_MS);
}

// Parse "YYYY-MM-DD" → {y, m, d}
export function parseIsoDate(iso: string): { year: number; month: number; day: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}

// Lista candidata de slots de un día (hora CR), sin filtrar disponibilidad.
// Devuelve los instantes UTC de inicio.
export function generateDaySlots(year: number, month: number, day: number): Date[] {
  const slots: Date[] = [];
  // Convertimos las horas de trabajo a minutos desde 00:00 CR
  const startMin = WORK_START_HOUR * 60;
  const endMin = WORK_END_HOUR * 60;
  for (let t = startMin; t + SLOT_DURATION_MIN <= endMin; t += SLOT_STEP_MIN) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    slots.push(crLocalToUtc(year, month, day, h, m));
  }
  return slots;
}

export function addMinutes(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * MIN_MS);
}

// ¿El slot [start, start+duration] choca con el evento [evStart, evEnd]
// respetando un buffer (en minutos) a cada lado?
export function slotConflictsWithEvent(
  slotStart: Date,
  slotEnd: Date,
  evStart: Date,
  evEnd: Date,
  bufferMin: number,
): boolean {
  const bufMs = bufferMin * MIN_MS;
  return (
    slotEnd.getTime() > evStart.getTime() - bufMs &&
    slotStart.getTime() < evEnd.getTime() + bufMs
  );
}

// Formato corto "9:00 AM" en español para mostrar
export function formatCrTime(d: Date): string {
  const shifted = utcToCrShifted(d);
  const h24 = shifted.getUTCHours();
  const m = shifted.getUTCMinutes();
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm = m.toString().padStart(2, "0");
  return `${h12}:${mm} ${period}`;
}

// "YYYY-MM-DD" a partir de un Date interpretado como día local CR
export function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
