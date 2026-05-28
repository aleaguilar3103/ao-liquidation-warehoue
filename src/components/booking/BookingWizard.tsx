"use client";

import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Hourglass,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  User,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import CustomCalendar from "@/components/booking/CustomCalendar";
import { cn } from "@/lib/utils";

const BUSINESS_TYPES = [
  "Tienda física",
  "Tienda en línea / E-commerce",
  "Revendedor / Reventa",
  "Mayorista / Distribuidor",
  "Aún estoy explorando",
  "Otro",
];

// Códigos de país. Default Costa Rica. Mandamos el prefijo a GHL en formato E.164
// para que no asuma +1 en todos los números.
const COUNTRY_CODES: Array<{ code: string; dial: string; flag: string; name: string }> = [
  { code: "CR", dial: "+506", flag: "🇨🇷", name: "Costa Rica" },
  { code: "US", dial: "+1", flag: "🇺🇸", name: "Estados Unidos / Canadá" },
  { code: "MX", dial: "+52", flag: "🇲🇽", name: "México" },
  { code: "GT", dial: "+502", flag: "🇬🇹", name: "Guatemala" },
  { code: "SV", dial: "+503", flag: "🇸🇻", name: "El Salvador" },
  { code: "HN", dial: "+504", flag: "🇭🇳", name: "Honduras" },
  { code: "NI", dial: "+505", flag: "🇳🇮", name: "Nicaragua" },
  { code: "PA", dial: "+507", flag: "🇵🇦", name: "Panamá" },
  { code: "DO", dial: "+1", flag: "🇩🇴", name: "República Dominicana" },
  { code: "CO", dial: "+57", flag: "🇨🇴", name: "Colombia" },
  { code: "VE", dial: "+58", flag: "🇻🇪", name: "Venezuela" },
  { code: "EC", dial: "+593", flag: "🇪🇨", name: "Ecuador" },
  { code: "PE", dial: "+51", flag: "🇵🇪", name: "Perú" },
  { code: "CL", dial: "+56", flag: "🇨🇱", name: "Chile" },
  { code: "AR", dial: "+54", flag: "🇦🇷", name: "Argentina" },
  { code: "ES", dial: "+34", flag: "🇪🇸", name: "España" },
];

const CATEGORIES = [
  "Electrodomésticos",
  "Hogar y muebles",
  "Tecnología / Electrónica",
  "Herramientas / Ferretería",
  "Juguetes / Niños",
  "Ropa y calzado",
  "Belleza y cuidado personal",
  "Variedad / Mixto",
];

const LOGO_URL =
  "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/68f6739418c4202b283f9ef9.png";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  dialCode: string;
  phone: string;
  business: string;
  businessType: string;
  categories: string[];
  message: string;
  dateIso: string | null;
  slotIso: string | null;
};

type SlotResponse = {
  date: string;
  durationMin: number;
  slots: Array<{ startIso: string; endIso: string; available: boolean }>;
};

// Pasos del wizard. "success" no cuenta para el progreso.
const STEPS = [
  "name",
  "email",
  "phone",
  "business",
  "businessType",
  "categories",
  "message",
  "date",
  "time",
  "review",
  "success",
] as const;
type Step = (typeof STEPS)[number];

const PROGRESS_STEPS: Step[] = [
  "name",
  "email",
  "phone",
  "business",
  "businessType",
  "categories",
  "message",
  "date",
  "time",
  "review",
];

function todayInCrIso(): string {
  const now = new Date();
  const cr = new Date(now.getTime() + -6 * 3600 * 1000);
  return `${cr.getUTCFullYear()}-${String(cr.getUTCMonth() + 1).padStart(2, "0")}-${String(cr.getUTCDate()).padStart(2, "0")}`;
}
function ymOfIso(iso: string): string {
  return iso.slice(0, 7);
}
function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}
function compareIso(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
function isoToWeekdayUtc(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
}
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

export default function BookingWizard() {
  const [step, setStep] = useState<Step>("name");
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    dialCode: "+506",
    phone: "",
    business: "",
    businessType: "",
    categories: [],
    message: "",
    dateIso: null,
    slotIso: null,
  });
  const [error, setError] = useState<string>("");

  const today = useMemo(() => todayInCrIso(), []);
  const maxDate = useMemo(() => addDaysIso(today, 60), [today]);
  const [viewMonth, setViewMonth] = useState<string>(ymOfIso(today));

  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string>("");
  const [slots, setSlots] = useState<SlotResponse["slots"]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{
    startIso: string;
    endIso: string;
  } | null>(null);

  // Progreso (success no cuenta)
  const currentProgressIdx = PROGRESS_STEPS.indexOf(step);
  const progress =
    step === "success"
      ? 100
      : Math.round(((currentProgressIdx + 1) / (PROGRESS_STEPS.length + 1)) * 100);

  // Cargar slots al elegir fecha
  useEffect(() => {
    if (!form.dateIso) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError("");
    setForm((f) => ({ ...f, slotIso: null }));
    fetch(`/api/booking/slots?date=${form.dateIso}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "No pudimos cargar la disponibilidad");
        return data as SlotResponse;
      })
      .then((data) => {
        if (cancelled) return;
        setSlots(data.slots);
      })
      .catch((err) => {
        if (cancelled) return;
        setSlotsError(err instanceof Error ? err.message : "Error desconocido");
        setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form.dateIso]);

  const stepIndex = STEPS.indexOf(step);
  const goNext = () => setStep(STEPS[stepIndex + 1]);
  const goPrev = () => setStep(STEPS[Math.max(0, stepIndex - 1)]);

  const validateAndNext = () => {
    setError("");
    switch (step) {
      case "name":
        if (!form.firstName.trim() || form.firstName.trim().length < 2) {
          return setError("Ingresá tu nombre.");
        }
        if (!form.lastName.trim()) {
          return setError("Ingresá tu apellido.");
        }
        break;
      case "email":
        if (!/^\S+@\S+\.\S+$/.test(form.email)) {
          return setError("Ingresá un correo válido.");
        }
        break;
      case "phone":
        if (form.phone.replace(/\D/g, "").length < 8) {
          return setError("Ingresá un WhatsApp válido (mínimo 8 dígitos).");
        }
        break;
      case "businessType":
        if (!form.businessType) {
          return setError("Elegí una opción para continuar.");
        }
        break;
      case "date":
        if (!form.dateIso) return setError("Elegí una fecha para continuar.");
        break;
      case "time":
        if (!form.slotIso) return setError("Elegí un horario para continuar.");
        break;
    }
    goNext();
  };

  const isDateDisabled = (iso: string): boolean => {
    if (compareIso(iso, today) < 0) return true;
    if (compareIso(iso, maxDate) > 0) return true;
    if (isoToWeekdayUtc(iso) === 0) return true;
    return false;
  };

  const submit = async () => {
    if (!form.slotIso) return;
    setSubmitting(true);
    setError("");
    try {
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
      const e164Phone = `${form.dialCode}${form.phone.replace(/\D/g, "")}`;
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: form.email,
          phone: e164Phone,
          business: form.business,
          businessType: form.businessType,
          categories: form.categories,
          message: form.message,
          startIso: form.slotIso,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "No pudimos confirmar la valoración");
      setConfirmed({ startIso: data.startIso, endIso: data.endIso });
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="container mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="relative h-8 w-28 flex-shrink-0">
              <Image
                src={LOGO_URL}
                alt="AO Liquidation Warehouse"
                fill
                className="object-contain object-left"
              />
            </div>
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand to-brand-dark transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs font-bold text-brand tabular-nums w-9 text-right">
                {progress}%
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 md:py-16">
        <div className="w-full max-w-2xl">
          {step === "name" && (
            <QuestionShell
              eyebrow="Pregunta 1 de 8"
              question="¿Cuál es tu nombre?"
              hint="Para que el agente sepa con quién va a hablar."
              meta={
                <div className="inline-flex items-center gap-3 bg-brand/5 border border-brand/15 rounded-full px-4 py-2 text-xs md:text-sm font-medium text-gray-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Hourglass className="w-4 h-4 text-brand" />
                    Te toma ~45 segundos
                  </span>
                  <span className="w-px h-3.5 bg-brand/20" />
                  <span className="inline-flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-brand" />
                    Solo 8 preguntas
                  </span>
                </div>
              }
              error={error}
              onBack={null}
              onNext={validateAndNext}
              canSubmitOnEnter
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInput
                  icon={User}
                  autoFocus
                  value={form.firstName}
                  onChange={(v) => setForm({ ...form, firstName: v })}
                  onEnter={validateAndNext}
                  placeholder="Nombre"
                  autoComplete="given-name"
                />
                <TextInput
                  icon={User}
                  value={form.lastName}
                  onChange={(v) => setForm({ ...form, lastName: v })}
                  onEnter={validateAndNext}
                  placeholder="Apellido"
                  autoComplete="family-name"
                />
              </div>
            </QuestionShell>
          )}

          {step === "email" && (
            <QuestionShell
              eyebrow="Pregunta 2 de 8"
              question="¿Tu mejor correo electrónico?"
              hint="Te mandamos la confirmación ahí — revisá spam por si acaso."
              error={error}
              onBack={goPrev}
              onNext={validateAndNext}
              canSubmitOnEnter
            >
              <TextInput
                icon={Mail}
                type="email"
                autoFocus
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                onEnter={validateAndNext}
                placeholder="tu@correo.com"
                autoComplete="email"
              />
            </QuestionShell>
          )}

          {step === "phone" && (
            <QuestionShell
              eyebrow="Pregunta 3 de 8"
              question="¿Tu WhatsApp?"
              hint="Para coordinar la llamada y mandarte recordatorios."
              error={error}
              onBack={goPrev}
              onNext={validateAndNext}
              canSubmitOnEnter
            >
              <PhoneInput
                dialCode={form.dialCode}
                phone={form.phone}
                onChangeDial={(v) => setForm({ ...form, dialCode: v })}
                onChangePhone={(v) => setForm({ ...form, phone: v })}
                onEnter={validateAndNext}
              />
            </QuestionShell>
          )}

          {step === "business" && (
            <QuestionShell
              eyebrow="Pregunta 4 de 8"
              question="¿Cómo se llama tu negocio?"
              hint="Opcional. Si aún no tiene nombre, podés saltar este paso."
              error={error}
              onBack={goPrev}
              onNext={validateAndNext}
              onSkip={validateAndNext}
              canSubmitOnEnter
            >
              <TextInput
                icon={Briefcase}
                autoFocus
                value={form.business}
                onChange={(v) => setForm({ ...form, business: v })}
                onEnter={validateAndNext}
                placeholder="Opcional"
              />
            </QuestionShell>
          )}

          {step === "businessType" && (
            <QuestionShell
              eyebrow="Pregunta 5 de 8"
              question="¿Qué describe mejor tu negocio?"
              hint="Elegí una. Te ayuda al agente a llegar mejor preparado."
              error={error}
              onBack={goPrev}
              onNext={validateAndNext}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BUSINESS_TYPES.map((bt) => {
                  const active = form.businessType === bt;
                  return (
                    <button
                      key={bt}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, businessType: bt });
                        // auto-avance suave después de seleccionar
                        setTimeout(() => goNext(), 200);
                      }}
                      className={cn(
                        "group text-left px-4 py-4 rounded-2xl border-2 transition-all flex items-center gap-3",
                        active
                          ? "bg-brand text-white border-brand shadow-lg shadow-brand/20"
                          : "bg-white border-gray-200 text-gray-700 hover:border-brand/40 hover:bg-brand/5",
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                          active ? "border-white bg-white" : "border-gray-300 group-hover:border-brand",
                        )}
                      >
                        {active && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                      </div>
                      <span className="font-semibold text-sm md:text-base">{bt}</span>
                    </button>
                  );
                })}
              </div>
            </QuestionShell>
          )}

          {step === "categories" && (
            <QuestionShell
              eyebrow="Pregunta 6 de 8"
              question="¿Qué categorías te interesan?"
              hint="Podés elegir varias. O ninguna si aún no sabés."
              error={error}
              onBack={goPrev}
              onNext={validateAndNext}
              onSkip={validateAndNext}
            >
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const active = form.categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          categories: active
                            ? form.categories.filter((c) => c !== cat)
                            : [...form.categories, cat],
                        })
                      }
                      className={cn(
                        "text-sm font-semibold px-4 py-2.5 rounded-full border-2 transition-all",
                        active
                          ? "bg-amber-100 border-amber-300 text-amber-900 shadow-sm"
                          : "bg-white border-gray-200 text-gray-700 hover:border-amber-300",
                      )}
                    >
                      {active ? "✓ " : ""}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </QuestionShell>
          )}

          {step === "message" && (
            <QuestionShell
              eyebrow="Pregunta 7 de 8"
              question="¿Hay algo más que el agente deba saber?"
              hint="Opcional. Una o dos líneas alcanzan."
              error={error}
              onBack={goPrev}
              onNext={validateAndNext}
              onSkip={validateAndNext}
            >
              <div className="relative">
                <MessageCircle className="w-5 h-5 absolute left-4 top-4 text-gray-400" />
                <textarea
                  autoFocus
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Opcional…"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-brand outline-none text-base resize-none"
                />
              </div>
            </QuestionShell>
          )}

          {step === "date" && (
            <QuestionShell
              eyebrow="Pregunta 8 de 8"
              question="Elegí el día de tu valoración"
              hint="Lunes a sábado, 8:00 AM a 5:00 PM (hora Costa Rica)."
              error={error}
              onBack={goPrev}
              onNext={validateAndNext}
            >
              <div className="rounded-2xl border-2 border-gray-100 p-5 md:p-6 bg-gray-50/40">
                <CustomCalendar
                  viewMonth={viewMonth}
                  onChangeMonth={setViewMonth}
                  selectedDate={form.dateIso}
                  onSelectDate={(iso) => setForm({ ...form, dateIso: iso })}
                  isDateDisabled={isDateDisabled}
                />
              </div>
            </QuestionShell>
          )}

          {step === "time" && (
            <QuestionShell
              eyebrow="Último paso"
              question="Elegí la hora"
              hint={form.dateIso ? formatLongDateEs(form.dateIso) : ""}
              error={error}
              onBack={goPrev}
              onNext={validateAndNext}
            >
              <TimeSlotPanel
                loading={slotsLoading}
                error={slotsError}
                slots={slots}
                selectedSlot={form.slotIso}
                onSelect={(iso) => setForm({ ...form, slotIso: iso })}
              />
            </QuestionShell>
          )}

          {step === "review" && (
            <ReviewStep
              form={form}
              error={error}
              submitting={submitting}
              onBack={goPrev}
              onConfirm={submit}
            />
          )}

          {step === "success" && confirmed && (
            <SuccessStep
              startIso={confirmed.startIso}
              endIso={confirmed.endIso}
              name={form.firstName}
              email={form.email}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// =========================================================================
// Question shell
// =========================================================================

function QuestionShell({
  eyebrow,
  question,
  hint,
  meta,
  error,
  children,
  onBack,
  onNext,
  onSkip,
  canSubmitOnEnter,
}: {
  eyebrow: string;
  question: string;
  hint?: string;
  meta?: React.ReactNode;
  error: string;
  children: React.ReactNode;
  onBack: (() => void) | null;
  onNext: () => void;
  onSkip?: () => void;
  canSubmitOnEnter?: boolean;
}) {
  useEffect(() => {
    if (!canSubmitOnEnter) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        const target = e.target as HTMLElement | null;
        if (target?.tagName === "TEXTAREA") return;
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canSubmitOnEnter, onNext]);

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-brand/5 border border-gray-100 p-6 md:p-10">
      <div className="text-xs md:text-sm font-bold uppercase tracking-wider text-brand mb-2">
        {eyebrow}
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
        {question}
      </h2>
      {hint && <p className="text-sm text-gray-500 mt-2">{hint}</p>}
      {meta && <div className="mt-4">{meta}</div>}

      <div className="mt-7">{children}</div>

      {error && (
        <div className="mt-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
        <div className="flex gap-2 justify-center sm:justify-start">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-gray-600 hover:text-brand font-medium px-4 py-3 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </button>
          )}
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex items-center text-gray-500 hover:text-gray-800 font-medium px-4 py-3 rounded-xl transition-colors text-sm"
            >
              Saltar
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onNext}
          className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-brand-dark hover:opacity-95 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-brand/20 transition"
        >
          Siguiente
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

function TextInput({
  icon: Icon,
  type = "text",
  value,
  onChange,
  onEnter,
  placeholder,
  autoComplete,
  autoFocus,
}: {
  icon: React.ComponentType<{ className?: string }>;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="relative">
      <Icon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type={type}
        autoFocus={autoFocus}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onEnter?.();
          }
        }}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-brand outline-none text-base"
      />
    </div>
  );
}

function PhoneInput({
  dialCode,
  phone,
  onChangeDial,
  onChangePhone,
  onEnter,
}: {
  dialCode: string;
  phone: string;
  onChangeDial: (v: string) => void;
  onChangePhone: (v: string) => void;
  onEnter?: () => void;
}) {
  // El value del select es el código de país (único), no el dial (que se repite, ej +1)
  const selected =
    COUNTRY_CODES.find((c) => c.dial === dialCode) ?? COUNTRY_CODES[0];

  return (
    <div className="flex gap-2">
      <div className="relative flex-shrink-0">
        <select
          value={selected.code}
          onChange={(e) => {
            const c = COUNTRY_CODES.find((x) => x.code === e.target.value);
            if (c) onChangeDial(c.dial);
          }}
          className="h-full appearance-none pl-3 pr-9 py-4 rounded-2xl border-2 border-gray-200 focus:border-brand outline-none text-base font-semibold bg-white cursor-pointer"
          aria-label="Código de país"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.dial}
            </option>
          ))}
        </select>
        <svg
          className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <div className="relative flex-1">
        <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="tel"
          autoFocus
          inputMode="tel"
          value={phone}
          onChange={(e) => onChangePhone(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onEnter?.();
            }
          }}
          placeholder="8888 8888"
          autoComplete="tel-national"
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-brand outline-none text-base"
        />
      </div>
    </div>
  );
}

function TimeSlotPanel({
  loading,
  error,
  slots,
  selectedSlot,
  onSelect,
}: {
  loading: boolean;
  error: string;
  slots: SlotResponse["slots"];
  selectedSlot: string | null;
  onSelect: (iso: string) => void;
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border-2 border-gray-100 bg-gray-50/40 p-10 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mb-3" />
        <p className="text-sm">Buscando disponibilidad...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
        {error}
      </div>
    );
  }
  const noneAvailable = slots.length === 0 || !slots.some((s) => s.available);
  if (noneAvailable) {
    return (
      <div className="rounded-2xl border-2 border-gray-100 bg-gray-50/40 p-10 text-center text-gray-500">
        <Clock className="w-6 h-6 mx-auto mb-3 text-gray-400" />
        <p className="text-sm font-semibold text-gray-700">Sin espacios este día</p>
        <p className="text-xs mt-1">Probá con otro día.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {slots.map((s) => {
        const active = selectedSlot === s.startIso;
        return (
          <button
            key={s.startIso}
            type="button"
            disabled={!s.available}
            onClick={() => onSelect(s.startIso)}
            className={cn(
              "px-3 py-4 rounded-xl text-sm font-bold border-2 transition-all",
              !s.available &&
                "bg-gray-50 border-gray-100 text-gray-300 line-through cursor-not-allowed",
              s.available &&
                !active &&
                "bg-white border-gray-200 text-gray-800 hover:border-brand hover:text-brand hover:bg-brand/5 hover:-translate-y-0.5",
              active &&
                "bg-gradient-to-br from-brand to-brand-dark border-brand-dark text-white shadow-lg shadow-brand/30 -translate-y-0.5",
            )}
          >
            {formatCrTimeFromIso(s.startIso)}
          </button>
        );
      })}
    </div>
  );
}

// =========================================================================
// Review
// =========================================================================

function ReviewStep({
  form,
  error,
  submitting,
  onBack,
  onConfirm,
}: {
  form: FormState;
  error: string;
  submitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-brand/5 border border-gray-100 p-6 md:p-10">
      <div className="text-xs md:text-sm font-bold uppercase tracking-wider text-brand mb-2">
        Casi listo
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">
        Revisá tu valoración antes de confirmar
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        Si todo se ve bien, le damos a confirmar y listo.
      </p>

      <div className="space-y-3">
        <ReviewRow
          icon={User}
          label="Nombre"
          value={`${form.firstName} ${form.lastName}`.trim()}
        />
        <ReviewRow icon={Mail} label="Correo" value={form.email} />
        <ReviewRow
          icon={Phone}
          label="WhatsApp"
          value={`${form.dialCode} ${form.phone}`.trim()}
        />
        {form.business && (
          <ReviewRow icon={Briefcase} label="Negocio" value={form.business} />
        )}
        <ReviewRow icon={Sparkles} label="Tipo de negocio" value={form.businessType} />
        {form.categories.length > 0 && (
          <ReviewRow
            icon={ClipboardList}
            label="Categorías"
            value={form.categories.join(", ")}
          />
        )}
        <div className="h-px bg-gray-100 my-4" />
        <ReviewRow
          icon={CalendarDays}
          label="Fecha"
          value={form.dateIso ? formatLongDateEs(form.dateIso) : ""}
          highlight
        />
        <ReviewRow
          icon={Clock}
          label="Hora (CR)"
          value={form.slotIso ? formatCrTimeFromIso(form.slotIso) : ""}
          highlight
        />
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-1.5 text-gray-600 hover:text-brand font-medium px-4 py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Atrás
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          className={cn(
            "inline-flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-xl transition-all",
            submitting
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-brand to-brand-dark text-white shadow-lg shadow-brand/30 hover:opacity-95",
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Confirmando...
            </>
          ) : (
            <>
              Confirmar mi valoración
              <CheckCircle2 className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ReviewRow({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-xl",
        highlight ? "bg-brand/5 border border-brand/15" : "bg-gray-50/60",
      )}
    >
      <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", highlight ? "text-brand" : "text-gray-500")} />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold tracking-wider uppercase text-gray-500">
          {label}
        </div>
        <div className={cn("font-semibold break-words", highlight ? "text-brand" : "text-gray-900")}>
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// Success (con timer y redirect cancelable)
// =========================================================================

const REDIRECT_SECONDS = 15;

function SuccessStep({
  startIso,
  endIso,
  name,
  email,
}: {
  startIso: string;
  endIso: string;
  name: string;
  email: string;
}) {
  const date = new Date(startIso);
  const cr = new Date(date.getTime() + -6 * 3600 * 1000);
  const crIsoDay = `${cr.getUTCFullYear()}-${String(cr.getUTCMonth() + 1).padStart(2, "0")}-${String(cr.getUTCDate()).padStart(2, "0")}`;
  const dayLabel = formatLongDateEs(crIsoDay);
  const timeLabel = `${formatCrTimeFromIso(startIso)} – ${formatCrTimeFromIso(endIso)}`;

  const [secondsLeft, setSecondsLeft] = useState<number>(REDIRECT_SECONDS);
  const [paused, setPaused] = useState(false);

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

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-brand/5 border border-gray-100 p-6 md:p-12 text-center">
      <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
        ¡Tu valoración está reservada!
      </h2>
      <p className="text-gray-600 max-w-md mx-auto">
        Gracias, {name.split(" ")[0]}. Un agente AO te va a llamar en el horario
        que elegiste.
      </p>

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
            <div className="font-semibold text-gray-900 break-all">{email}</div>
            <div className="text-xs text-gray-500 mt-1">
              Si no la ves, revisá tu carpeta de spam.
            </div>
          </div>
        </div>
      </div>

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
  );
}
