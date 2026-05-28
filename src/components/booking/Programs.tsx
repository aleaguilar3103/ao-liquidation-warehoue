"use client";

import { ArrowRight, Container, Layers3, PackageOpen, Sparkles } from "lucide-react";
import Link from "next/link";

const BRAND_TAGS = ["Walmart", "Amazon", "Target", "Costco", "Costway"];

const programs = [
  {
    icon: PackageOpen,
    name: "Lote",
    tagline: "Para empezar a probar",
    description:
      "Caja o lote pequeño con mercancía mixta. Ideal para quien recién arranca y quiere conocer el producto.",
    highlights: [
      "Inversión más baja",
      "Mezcla de categorías",
      "Rotación rápida",
    ],
    color: "from-amber-400/20 to-amber-100/40",
    iconBg: "bg-amber-500",
    accent: "text-amber-700 border-amber-200 bg-amber-50",
  },
  {
    icon: Layers3,
    name: "Pallet",
    tagline: "Para escalar consistente",
    description:
      "Pallet completo de una categoría específica o mixto premium. Pensado para tiendas y revendedores con flujo activo.",
    highlights: [
      "Mejor costo por unidad",
      "Variedad por categoría",
      "Reabastecimiento semanal",
    ],
    color: "from-brand/10 to-brand/5",
    iconBg: "bg-brand",
    accent: "text-brand border-brand/20 bg-brand/5",
    featured: true,
  },
  {
    icon: Container,
    name: "Contenedor",
    tagline: "Para mayoristas y distribuidores",
    description:
      "Contenedor completo importado directo desde EE. UU. Mejor precio por unidad y máxima eficiencia logística.",
    highlights: [
      "Precio mayorista",
      "Volumen alto",
      "Logística asistida",
    ],
    color: "from-slate-200/40 to-slate-100/40",
    iconBg: "bg-slate-700",
    accent: "text-slate-700 border-slate-300 bg-slate-50",
  },
];

export default function Programs() {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-white via-gray-50/50 to-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand/5 border border-brand/15 text-brand text-xs md:text-sm font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            Nuestros programas
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Tres caminos. <span className="text-brand">Uno te calza.</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Da igual si recién arrancás o si manejás volumen mayorista — tenemos
            un formato pensado para vos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-10">
          {programs.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.name}
                className={`group relative rounded-3xl border-2 ${
                  p.featured ? "border-brand shadow-2xl shadow-brand/20 md:scale-[1.02]" : "border-gray-100 hover:border-brand/30"
                } bg-white overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl`}
              >
                {p.featured && (
                  <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-amber-400 to-amber-300 text-brand-dark text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
                    Más popular
                  </div>
                )}

                <div className={`bg-gradient-to-br ${p.color} p-6 pb-12`}>
                  <div className={`w-14 h-14 rounded-2xl ${p.iconBg} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>

                <div className="p-6 -mt-8 relative">
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      {p.tagline}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {p.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {p.description}
                    </p>

                    <ul className="space-y-2 mb-5">
                      {p.highlights.map((h) => (
                        <li
                          key={h}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border ${p.accent} inline-flex items-center gap-1.5 mr-1.5`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {h}
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4 border-t border-gray-100">
                      <div className="text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-2">
                        Marcas incluidas
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {BRAND_TAGS.map((b) => (
                          <span
                            key={b}
                            className="text-[10px] font-semibold px-2 py-1 rounded-md bg-gray-100 text-gray-700"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            href="/valoracion/agendar"
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-brand to-brand-dark hover:opacity-95 text-white font-semibold px-8 py-4 rounded-xl shadow-xl shadow-brand/20 transition"
          >
            ¿Cuál es el tuyo? Hablemos 15 min
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
