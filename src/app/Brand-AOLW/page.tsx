"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Copy,
  Check,
  Download,
  Palette,
  Type,
  LayoutGrid,
  Sparkles,
  ImageIcon,
  ShieldCheck,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  DATOS DE MARCA — AO Liquidation Warehouse                          */
/* ------------------------------------------------------------------ */

const LOGOS = [
  {
    name: "Logo Principal (claro)",
    desc: "Versión para fondos oscuros / navy. Uso preferente.",
    url: "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/68f6739418c4202b283f9ef9.png",
    file: "AOLW-logo-principal.png",
    bg: "dark" as const,
  },
  {
    name: "Imagen Social / OG",
    desc: "Imagen para compartir en redes (1200×630).",
    url: "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/6902623210e460f861271016.png",
    file: "AOLW-social-og.png",
    bg: "light" as const,
  },
];

const COLOR_GROUPS = [
  {
    title: "Primarios",
    colors: [
      { name: "Navy Principal", hex: "#0F233F", text: "#FFFFFF" },
      { name: "Navy Profundo", hex: "#0A1829", text: "#FFFFFF" },
    ],
  },
  {
    title: "Azules secundarios (gradientes)",
    colors: [
      { name: "Azul Acero", hex: "#1E3A5F", text: "#FFFFFF" },
      { name: "Azul Medio", hex: "#26466F", text: "#FFFFFF" },
      { name: "Azul Claro", hex: "#2D4A6F", text: "#FFFFFF" },
      { name: "Azul Noche", hex: "#0F1E30", text: "#FFFFFF" },
    ],
  },
  {
    title: "Acento",
    colors: [
      { name: "Rojo Marca", hex: "#E11D27", text: "#FFFFFF" },
      { name: "Rojo Oscuro", hex: "#B91019", text: "#FFFFFF" },
      { name: "Dorado / Ámbar", hex: "#FBBF24", text: "#0A1829" },
    ],
  },
  {
    title: "Neutros",
    colors: [
      { name: "Blanco", hex: "#FFFFFF", text: "#1F2937" },
      { name: "Gris Fondo", hex: "#F8FAFC", text: "#1F2937" },
      { name: "Gris Fondo 2", hex: "#FAFBFD", text: "#1F2937" },
      { name: "Gris Borde", hex: "#E5E7EB", text: "#1F2937" },
      { name: "Gris Texto", hex: "#6B7280", text: "#FFFFFF" },
      { name: "Gris Oscuro", hex: "#1F2937", text: "#FFFFFF" },
    ],
  },
];

const GRADIENTS = [
  {
    name: "Principal (Header / Footer)",
    css: "linear-gradient(to right, #0F233F, #0A1829)",
  },
  {
    name: "Diagonal",
    css: "linear-gradient(to bottom right, #0F233F, #0A1829)",
  },
  {
    name: "Marquesina de Marcas",
    css: "linear-gradient(to right, #1E3A5F, #2D4A6F)",
  },
  {
    name: "Marquesina (3 pasos)",
    css: "linear-gradient(to right, #1E3A5F, #26466F, #1E3A5F)",
  },
  {
    name: "Acento Rojo",
    css: "linear-gradient(to right, #E11D27, #B91019)",
  },
  {
    name: "Acento Dorado",
    css: "linear-gradient(to right, #FBBF24, #F59E0B)",
  },
];

const FONT_WEIGHTS = [
  { label: "ExtraBold · 800", weight: 800, use: "Titulares grandes / Hero" },
  { label: "Bold · 700", weight: 700, use: "Titulares y CTA" },
  { label: "SemiBold · 600", weight: 600, use: "Subtítulos / etiquetas" },
  { label: "Medium · 500", weight: 500, use: "Énfasis en cuerpo" },
  { label: "Regular · 400", weight: 400, use: "Texto de cuerpo" },
];

const FORMATS = [
  {
    id: "1-1",
    ratio: "1:1",
    name: "Cuadrado",
    size: "1080 × 1080 px",
    use: "Feed de Instagram / Facebook",
    safe: "Margen interior del 8 % (≈ 86 px por lado).",
    insetX: 8,
    insetY: 8,
    extra: null,
    prompt: `--- ESPECIFICACIONES DE MARCA · AO LIQUIDATION WAREHOUSE ---
Formato: 1:1 (cuadrado). Resolución 1080×1080 px.
Zona segura: mantén TODO el texto, el logo y los elementos clave dentro de un margen interior del 8 % (≈86 px por lado). Nada importante debe tocar el borde.
Paleta: fondos azul marino #0F233F y #0A1829; acento rojo de marca #E11D27 para CTAs y detalles; texto blanco #FFFFFF sobre fondos oscuros.
Tipografía: Inter (titulares en Bold/ExtraBold, cuerpo en Regular).
Logo: AO Liquidation Warehouse en versión clara, dentro de la zona segura (esquina superior o inferior).
Estilo: profesional, limpio, alto contraste, sensación premium de liquidación mayorista.`,
  },
  {
    id: "16-9",
    ratio: "16:9",
    name: "Horizontal",
    size: "1920 × 1080 px",
    use: "Web, YouTube, banners, presentaciones",
    safe: "Margen seguro del 5 % (≈ 96 px laterales, 54 px arriba/abajo).",
    insetX: 5,
    insetY: 5,
    extra: null,
    prompt: `--- ESPECIFICACIONES DE MARCA · AO LIQUIDATION WAREHOUSE ---
Formato: 16:9 (horizontal). Resolución 1920×1080 px.
Zona segura: mantén texto y elementos clave dentro de un margen del 5 % (≈96 px laterales, ≈54 px arriba/abajo) para que nada se recorte en distintas pantallas.
Paleta: fondos azul marino #0F233F y #0A1829; acento rojo de marca #E11D27 para CTAs y detalles; texto blanco #FFFFFF sobre fondos oscuros.
Tipografía: Inter (titulares en Bold/ExtraBold, cuerpo en Regular).
Logo: AO Liquidation Warehouse en versión clara, dentro de la zona segura.
Estilo: profesional, limpio, alto contraste, sensación premium de liquidación mayorista. Composición apaisada con espacio a la izquierda o derecha para el titular.`,
  },
  {
    id: "9-16",
    ratio: "9:16",
    name: "Vertical",
    size: "1080 × 1920 px",
    use: "Stories / Reels / TikTok",
    safe: "Superior 250 px (perfil), inferior 420 px (caption y CTA), laterales 64 px.",
    insetX: 6,
    insetTop: 13,
    insetBottom: 22,
    extra:
      "El espacio superior queda tapado por el nombre de usuario y el inferior por la barra de interacción; no pongas texto ahí.",
    prompt: `--- ESPECIFICACIONES DE MARCA · AO LIQUIDATION WAREHOUSE ---
Formato: 9:16 (vertical para Stories/Reels). Resolución 1080×1920 px.
Zona segura: deja libres los 250 px superiores (foto de perfil/nombre) y los 420 px inferiores (caption y botones de interacción). Laterales con margen de 64 px. Coloca el mensaje principal en el TERCIO CENTRAL.
Paleta: fondos azul marino #0F233F y #0A1829; acento rojo de marca #E11D27 para CTAs y detalles; texto blanco #FFFFFF sobre fondos oscuros.
Tipografía: Inter (titulares en Bold/ExtraBold, cuerpo en Regular).
Logo: AO Liquidation Warehouse en versión clara, dentro de la zona segura central-superior.
Estilo: profesional, limpio, alto contraste, sensación premium de liquidación mayorista. Composición vertical pensada para móvil a pantalla completa.`,
  },
  {
    id: "3-4",
    ratio: "3:4",
    name: "Retrato",
    size: "1080 × 1440 px",
    use: "Feed vertical de Instagram",
    safe: "Margen lateral del 8 % (≈ 86 px) y superior/inferior del 10 % (≈ 144 px).",
    insetX: 8,
    insetY: 10,
    extra: null,
    prompt: `--- ESPECIFICACIONES DE MARCA · AO LIQUIDATION WAREHOUSE ---
Formato: 3:4 (retrato vertical para feed). Resolución 1080×1440 px.
Zona segura: mantén texto y elementos clave dentro de un margen lateral del 8 % (≈86 px) y superior/inferior del 10 % (≈144 px).
Paleta: fondos azul marino #0F233F y #0A1829; acento rojo de marca #E11D27 para CTAs y detalles; texto blanco #FFFFFF sobre fondos oscuros.
Tipografía: Inter (titulares en Bold/ExtraBold, cuerpo en Regular).
Logo: AO Liquidation Warehouse en versión clara, dentro de la zona segura.
Estilo: profesional, limpio, alto contraste, sensación premium de liquidación mayorista. Composición vertical equilibrada.`,
  },
];

// Bloque de estilo visual que se agrega a TODOS los prompts
const STYLE = `--- ESTILO VISUAL DE MARCA (aplica siempre) ---
Predomina SIEMPRE el fondo claro/blanco: composición luminosa, limpia y con aire. El blanco (#FFFFFF) es el color dominante de la pieza.
Paleta: blanco dominante, azul marino #0F233F / #0A1829 y rojo de marca #E11D27 como acentos. Los titulares combinan azul marino + rojo.
Elementos 3D y con volumen: marcos/mockups tipo red social (tarjeta de Facebook con reacciones flotantes "me gusta" y corazón en rojo y azul), pódiums, insignias circulares, etiquetas tipo tag y botones con relieve y sombras suaves.
Tipografía: Inter (sans-serif gruesa, titulares en MAYÚSCULAS, parte del texto en azul marino y parte en rojo).
Logo "Liquidation Warehouse": la palabra "Liquidation" en rojo y "Warehouse" en azul marino, siempre sobre fondo claro.
Barra de contacto inferior: pastilla redondeada azul marino + rojo con ícono de WhatsApp/teléfono y el número.
Acabado profesional, comercial, alto contraste y sensación premium. Añade elementos temáticos según la campaña (nieve/navidad, almacén, pallets, camiones, marcas) sin perder el predominio del blanco.`;

const NAV = [
  { id: "logos", label: "Logos", icon: ImageIcon },
  { id: "colores", label: "Colores", icon: Palette },
  { id: "gradientes", label: "Gradientes", icon: LayoutGrid },
  { id: "tipografia", label: "Tipografía", icon: Type },
  { id: "formatos", label: "Formatos", icon: ShieldCheck },
  { id: "prompts", label: "Prompts IA", icon: Sparkles },
];

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
    } catch {
      /* noop */
    }
  };
  return { copied, copy };
}

async function downloadAsset(url: string, filename: string) {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  } catch {
    // Fallback: abrir en nueva pestaña si el navegador bloquea el blob
    window.open(url, "_blank");
  }
}

/* ------------------------------------------------------------------ */
/*  PÁGINA                                                             */
/* ------------------------------------------------------------------ */

export default function BrandPage() {
  const { copied, copy } = useCopy();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937]">
      {/* HERO */}
      <header className="bg-gradient-to-br from-[#0F233F] to-[#0A1829] text-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#FBBF24]">
            Manual de Marca
          </p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            AO Liquidation Warehouse — Parámetros de Diseño
          </h1>
          <p className="mt-3 max-w-2xl text-white/70">
            Recursos, colores, tipografía, formatos y prompts listos para copiar.
            Todo lo que necesitas para crear artes consistentes con la marca.
          </p>
        </div>
      </header>

      {/* NAV STICKY */}
      <nav className="sticky top-0 z-20 border-b border-[#E5E7EB] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
          {NAV.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F233F]"
            >
              <Icon className="h-4 w-4" />
              {label}
            </a>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl space-y-16 px-6 py-12">
        {/* ---------- LOGOS ---------- */}
        <Section id="logos" icon={ImageIcon} title="Logos">
          <div className="grid gap-6 sm:grid-cols-2">
            {LOGOS.map((logo) => (
              <div
                key={logo.url}
                className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"
              >
                <div
                  className={`flex h-44 items-center justify-center p-8 ${
                    logo.bg === "dark"
                      ? "bg-gradient-to-br from-[#0F233F] to-[#0A1829]"
                      : "bg-[#F8FAFC]"
                  }`}
                >
                  <div className="relative h-full w-full">
                    <Image
                      src={logo.url}
                      alt={logo.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <h3 className="font-semibold">{logo.name}</h3>
                    <p className="text-sm text-[#6B7280]">{logo.desc}</p>
                  </div>
                  <button
                    onClick={() => downloadAsset(logo.url, logo.file)}
                    className="flex shrink-0 items-center gap-2 rounded-lg bg-[#0F233F] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0A1829]"
                  >
                    <Download className="h-4 w-4" />
                    Descargar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ---------- COLORES ---------- */}
        <Section id="colores" icon={Palette} title="Paleta de colores">
          <p className="mb-6 text-sm text-[#6B7280]">
            Haz clic en cualquier código para copiarlo.
          </p>
          <div className="space-y-8">
            {COLOR_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#6B7280]">
                  {group.title}
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {group.colors.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => copy(c.hex, c.hex)}
                      className="group overflow-hidden rounded-xl border border-[#E5E7EB] bg-white text-left shadow-sm transition-transform hover:-translate-y-0.5"
                    >
                      <div
                        className="flex h-24 items-end p-3"
                        style={{ backgroundColor: c.hex, color: c.text }}
                      >
                        <span className="flex items-center gap-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100">
                          {copied === c.hex ? (
                            <>
                              <Check className="h-3 w-3" /> Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copiar
                            </>
                          )}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold">{c.name}</p>
                        <p className="font-mono text-xs text-[#6B7280]">
                          {c.hex}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ---------- GRADIENTES ---------- */}
        <Section id="gradientes" icon={LayoutGrid} title="Degradados">
          <div className="grid gap-5 sm:grid-cols-2">
            {GRADIENTS.map((g) => (
              <div
                key={g.name}
                className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"
              >
                <div className="h-28" style={{ background: g.css }} />
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-semibold">{g.name}</p>
                    <p className="truncate font-mono text-xs text-[#6B7280]">
                      {g.css}
                    </p>
                  </div>
                  <button
                    onClick={() => copy(`background: ${g.css};`, g.name)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-semibold text-[#0F233F] transition-colors hover:bg-[#F8FAFC]"
                  >
                    {copied === g.name ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> CSS
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ---------- TIPOGRAFÍA ---------- */}
        <Section id="tipografia" icon={Type} title="Tipografía">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E5E7EB] pb-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">
                  Fuente principal
                </p>
                <p className="text-4xl font-extrabold text-[#0F233F]">Inter</p>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Google Fonts · sans-serif. Úsala para todo: titulares y cuerpo.
                </p>
              </div>
              <a
                href="https://fonts.google.com/specimen/Inter"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-[#0F233F] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0A1829]"
              >
                <Download className="h-4 w-4" />
                Descargar en Google Fonts
              </a>
            </div>

            <div className="mt-6 space-y-4">
              {FONT_WEIGHTS.map((w) => (
                <div
                  key={w.weight}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#F1F5F9] pb-3"
                >
                  <span
                    className="text-2xl text-[#0F233F]"
                    style={{ fontWeight: w.weight }}
                  >
                    Liquidación Premium
                  </span>
                  <span className="text-sm text-[#6B7280]">
                    <span className="font-semibold text-[#1F2937]">
                      {w.label}
                    </span>{" "}
                    · {w.use}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ---------- FORMATOS ---------- */}
        <Section id="formatos" icon={ShieldCheck} title="Formatos y zonas seguras">
          <p className="mb-6 text-sm text-[#6B7280]">
            Cada diseño debe entregarse en estos cuatro formatos. La línea
            punteada marca la <strong>zona segura</strong>: ningún texto ni
            elemento importante debe salir de ella.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FORMATS.map((f) => (
              <FormatCard key={f.id} format={f} />
            ))}
          </div>
        </Section>

        {/* ---------- PROMPTS ---------- */}
        <Section id="prompts" icon={Sparkles} title="Prompts para IA generativa">
          <div className="mb-6 rounded-xl border border-[#E11D27]/30 bg-[#E11D27]/5 p-4 text-sm text-[#1F2937]">
            <strong>Cómo usarlo:</strong> escribe tu idea/prompt en la IA y, al
            final, <strong>pega el bloque del formato que vas a generar</strong>.
            Así la IA respeta el tamaño, las zonas seguras, la paleta y la
            tipografía de la marca.
          </div>
          <div className="space-y-5">
            {FORMATS.map((f) => {
              const key = `prompt-${f.id}`;
              const fullPrompt = `${f.prompt}\n\n${STYLE}`;
              return (
                <div
                  key={f.id}
                  className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] bg-[#F8FAFC] px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-[#0F233F] px-2.5 py-1 font-mono text-sm font-bold text-white">
                        {f.ratio}
                      </span>
                      <span className="text-sm font-medium text-[#6B7280]">
                        {f.name} · {f.size}
                      </span>
                    </div>
                    <button
                      onClick={() => copy(fullPrompt, key)}
                      className="flex items-center gap-2 rounded-lg bg-[#E11D27] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#B91019]"
                    >
                      {copied === key ? (
                        <>
                          <Check className="h-4 w-4" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" /> Copiar bloque
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="overflow-x-auto whitespace-pre-wrap px-5 py-4 font-mono text-xs leading-relaxed text-[#1F2937]">
                    {fullPrompt}
                  </pre>
                </div>
              );
            })}
          </div>
        </Section>
      </main>

      <footer className="border-t border-[#E5E7EB] bg-white py-8 text-center text-sm text-[#6B7280]">
        AO Liquidation Warehouse · Manual de marca interno
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SUB-COMPONENTES                                                    */
/* ------------------------------------------------------------------ */

function Section({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F233F] text-white">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-2xl font-bold text-[#0F233F]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

type Format = (typeof FORMATS)[number];

function FormatCard({ format }: { format: Format }) {
  // Calcula el aspecto del recuadro de vista previa
  const [w, h] = format.ratio.split(":").map(Number);
  const insetTop = "insetTop" in format ? format.insetTop! : format.insetY ?? 8;
  const insetBottom =
    "insetBottom" in format ? format.insetBottom! : format.insetY ?? 8;
  const insetX = format.insetX;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex items-center justify-center bg-[#F1F5F9] p-5">
        {/* Vista previa con zona segura */}
        <div
          className="relative w-full max-w-[160px] overflow-hidden rounded-md bg-gradient-to-br from-[#0F233F] to-[#0A1829]"
          style={{ aspectRatio: `${w} / ${h}` }}
        >
          <div
            className="absolute rounded-sm border-2 border-dashed border-[#E11D27]"
            style={{
              top: `${insetTop}%`,
              bottom: `${insetBottom}%`,
              left: `${insetX}%`,
              right: `${insetX}%`,
            }}
          >
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold uppercase tracking-wide text-white/90">
              zona segura
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[#0F233F] px-2 py-0.5 font-mono text-xs font-bold text-white">
            {format.ratio}
          </span>
          <span className="font-semibold">{format.name}</span>
        </div>
        <p className="mt-2 font-mono text-sm font-semibold text-[#0F233F]">
          {format.size}
        </p>
        <p className="text-xs text-[#6B7280]">{format.use}</p>
        <div className="mt-3 border-t border-[#F1F5F9] pt-3">
          <p className="text-xs font-semibold text-[#1F2937]">Zona segura</p>
          <p className="text-xs text-[#6B7280]">{format.safe}</p>
          {format.extra && (
            <p className="mt-1 text-xs italic text-[#6B7280]">{format.extra}</p>
          )}
        </div>
      </div>
    </div>
  );
}
