"use client";

import {
  CalendarCheck2,
  CheckCircle2,
  Clock,
  Mail,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const LOGO_URL =
  "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/68f6739418c4202b283f9ef9.png";

const REDIRECT_SECONDS = 15;
const STORAGE_KEY = "ao_booking";
const TRACKED_KEY = "ao_booking_tracked";

type Booking = {
  startIso: string;
  endIso: string;
  firstName: string;
  email: string;
};

function formatLongDateEs(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  const dia = dt.toLocaleDateString("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)}`;
}

function formatCrTimeFromIso(iso: string): string {
  const dt = new Date(iso);
  const cr = new Date(dt.getTime() + -6 * 3600 * 1000);
  const h24 = cr.getUTCHours();
  const m = cr.getUTCMinutes();
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export default function ConfirmadaPage() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(REDIRECT_SECONDS);
  const [paused, setPaused] = useState(false);

  // Lee la reserva y dispara el evento de conversión a GTM (una sola vez)
  useEffect(() => {
    let data: Booking | null = null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) data = JSON.parse(raw) as Booking;
    } catch {
      data = null;
    }
    setBooking(data);
    setLoaded(true);

    if (data) {
      const alreadyTracked = sessionStorage.getItem(TRACKED_KEY) === data.startIso;
      if (!alreadyTracked) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "valoracion_agendada",
          valoracion_fecha: data.startIso,
        });
        try {
          sessionStorage.setItem(TRACKED_KEY, data.startIso);
        } catch {
          /* noop */
        }
      }
    }
  }, []);

  // Timer de redirección al home (cancelable)
  useEffect(() => {
    if (paused) return;
    if (secondsLeft <= 0) {
      window.location.assign("/");
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [secondsLeft, paused]);

  const progressPct = paused
    ? 100
    : Math.max(0, Math.min(100, (secondsLeft / REDIRECT_SECONDS) * 100));

  const dayLabel = booking
    ? (() => {
        const cr = new Date(new Date(booking.startIso).getTime() + -6 * 3600 * 1000);
        const crIsoDay = `${cr.getUTCFullYear()}-${String(cr.getUTCMonth() + 1).padStart(2, "0")}-${String(cr.getUTCDate()).padStart(2, "0")}`;
        return formatLongDateEs(crIsoDay);
      })()
    : "";
  const timeLabel = booking
    ? `${formatCrTimeFromIso(booking.startIso)} – ${formatCrTimeFromIso(booking.endIso)}`
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="container mx-auto max-w-4xl px-4 py-3">
          <div className="relative h-8 w-28">
            <Image
              src={LOGO_URL}
              alt="AO Liquidation Warehouse"
              fill
              className="object-contain object-left"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10 md:py-16">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-3xl shadow-xl shadow-brand/5 border border-gray-100 p-6 md:p-12 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              ¡Tu valoración está reservada!
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              {booking ? `Gracias, ${booking.firstName.split(" ")[0]}. ` : "Gracias. "}
              Un agente AO te va a llamar en el horario que elegiste.
            </p>

            {booking && (
              <div className="mt-8 max-w-md mx-auto rounded-2xl border-2 border-brand/20 bg-gradient-to-br from-brand/5 to-white p-6 text-left">
                <div className="flex items-start gap-3 mb-4">
                  <CalendarCheck2 className="w-5 h-5 text-brand mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Fecha
                    </div>
                    <div className="font-semibold text-gray-900">{dayLabel}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 mb-4">
                  <Clock className="w-5 h-5 text-brand mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Hora (Costa Rica)
                    </div>
                    <div className="font-semibold text-gray-900">{timeLabel}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-brand mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Confirmación enviada a
                    </div>
                    <div className="font-semibold text-gray-900 break-all">
                      {booking.email}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Si no la ves, revisá tu carpeta de spam.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loaded && !booking && (
              <p className="mt-6 text-sm text-gray-500 max-w-md mx-auto">
                Recibimos tu solicitud. Revisá tu correo (y la carpeta de spam) para
                ver los detalles de tu valoración.
              </p>
            )}

            <p className="text-sm text-gray-500 mt-6 max-w-md mx-auto">
              ¿Necesitás reagendar o cancelar? Escribinos por WhatsApp al{" "}
              <a
                href="https://wa.link/zvmnhy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand font-semibold hover:underline"
              >
                +506 7191 0009
              </a>
              .
            </p>

            <div className="mt-10 max-w-md mx-auto rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-700">
                  {paused ? (
                    <span>Redirección pausada.</span>
                  ) : (
                    <span>
                      Te llevamos al inicio en{" "}
                      <span className="font-bold text-brand">{secondsLeft}s</span>
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-brand hover:text-brand transition-colors text-gray-700"
                >
                  {paused ? "Reanudar" : "Quedarme aquí"}
                </button>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand to-brand-dark transition-all duration-1000 ease-linear"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
