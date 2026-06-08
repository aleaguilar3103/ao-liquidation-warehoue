import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reservá tu valoración",
  description:
    "Formulario de valoración gratuita con AO Liquidation Warehouse.",
  robots: { index: false, follow: false },
};

// ===========================================================================
// Página TEMPORAL para que Meta genere un formulario instantáneo a partir de
// este formulario web. NO toca el flujo real de /valoracion/agendar.
// Usa elementos nativos (radio / checkbox / email / tel) para que Meta detecte
// bien el tipo de cada pregunta, además de mostrar la etiqueta del tipo.
// ===========================================================================

const BUSINESS_TYPES = [
  "Tienda física",
  "Tienda en línea / E-commerce",
  "Revendedor / Reventa",
  "Mayorista / Distribuidor",
  "Aún estoy explorando",
  "Otro",
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

const LOGO_URL =
  "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/68f6739418c4202b283f9ef9.png";

function TipoTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-brand bg-brand/5 border border-brand/15 rounded-full px-2.5 py-0.5">
      {children}
    </span>
  );
}

function FieldLabel({
  numero,
  pregunta,
  tipo,
  opcional,
}: {
  numero: number;
  pregunta: string;
  tipo: string;
  opcional?: boolean;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className="text-base md:text-lg font-bold text-gray-900">
        {numero}. {pregunta}
        {!opcional && <span className="text-brand"> *</span>}
      </span>
      <TipoTag>{tipo}</TipoTag>
      {opcional && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Opcional
        </span>
      )}
    </div>
  );
}

export default function ReservarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-10 md:py-16 px-4">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_URL}
            alt="AO Liquidation Warehouse"
            className="mx-auto h-10 w-auto object-contain"
          />
          <h1 className="mt-6 text-2xl md:text-3xl font-bold text-gray-900">
            Reservá tu valoración gratuita
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Completá el formulario y un agente te contacta. Te toma menos de un minuto.
          </p>
        </div>

        <form
          action="#"
          method="post"
          className="space-y-8 rounded-3xl border border-gray-100 bg-white p-6 md:p-10 shadow-xl shadow-brand/5"
        >
          {/* 1. Nombre y apellido */}
          <fieldset>
            <FieldLabel numero={1} pregunta="¿Cuál es tu nombre?" tipo="Texto corto" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                name="nombre"
                required
                autoComplete="given-name"
                placeholder="Nombre"
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-brand outline-none text-base"
              />
              <input
                type="text"
                name="apellido"
                required
                autoComplete="family-name"
                placeholder="Apellido"
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-brand outline-none text-base"
              />
            </div>
          </fieldset>

          {/* 2. Correo */}
          <fieldset>
            <FieldLabel numero={2} pregunta="¿Tu mejor correo electrónico?" tipo="Correo electrónico" />
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="tu@correo.com"
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-brand outline-none text-base"
            />
          </fieldset>

          {/* 3. WhatsApp */}
          <fieldset>
            <FieldLabel numero={3} pregunta="¿Tu WhatsApp?" tipo="Teléfono" />
            <div className="flex gap-2">
              <select
                name="codigo_pais"
                defaultValue="CR"
                aria-label="Código de país"
                className="flex-shrink-0 px-3 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-brand outline-none text-base font-semibold bg-white"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.dial}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                name="telefono"
                required
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="8888 8888"
                className="flex-1 px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-brand outline-none text-base"
              />
            </div>
          </fieldset>

          {/* 4. Nombre del negocio */}
          <fieldset>
            <FieldLabel numero={4} pregunta="¿Cómo se llama tu negocio?" tipo="Texto corto" opcional />
            <input
              type="text"
              name="negocio"
              placeholder="Opcional"
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-brand outline-none text-base"
            />
          </fieldset>

          {/* 5. Tipo de negocio — Selección única (radio) */}
          <fieldset>
            <FieldLabel numero={5} pregunta="¿Qué describe mejor tu negocio?" tipo="Selección única" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BUSINESS_TYPES.map((bt) => (
                <label
                  key={bt}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-gray-200 cursor-pointer hover:border-brand/40 hover:bg-brand/5 transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand/5"
                >
                  <input
                    type="radio"
                    name="tipo_negocio"
                    value={bt}
                    required
                    className="h-4 w-4 accent-brand"
                  />
                  <span className="font-semibold text-sm text-gray-700">{bt}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 6. Categorías — Selección múltiple (checkbox) */}
          <fieldset>
            <FieldLabel
              numero={6}
              pregunta="¿Qué categorías te interesan?"
              tipo="Selección múltiple"
              opcional
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-gray-200 cursor-pointer hover:border-amber-300 hover:bg-amber-50 transition-colors has-[:checked]:border-amber-300 has-[:checked]:bg-amber-50"
                >
                  <input
                    type="checkbox"
                    name="categorias"
                    value={cat}
                    className="h-4 w-4 accent-amber-500 rounded"
                  />
                  <span className="font-semibold text-sm text-gray-700">{cat}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 7. Mensaje — Texto largo */}
          <fieldset>
            <FieldLabel
              numero={7}
              pregunta="¿Hay algo más que el agente deba saber?"
              tipo="Texto largo"
              opcional
            />
            <textarea
              name="mensaje"
              rows={4}
              placeholder="Opcional…"
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-brand outline-none text-base resize-none"
            />
          </fieldset>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-brand-dark hover:opacity-95 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-brand/20 transition"
          >
            Reservar mi valoración
          </button>

          <p className="text-center text-xs text-gray-400">
            Al enviar aceptás que te contactemos para coordinar tu valoración.
          </p>
        </form>
      </div>
    </div>
  );
}
