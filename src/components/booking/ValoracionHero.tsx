import Image from "next/image";
import Link from "next/link";
import { CalendarClock, ShieldCheck, Sparkles } from "lucide-react";

export default function ValoracionHero() {
  return (
    <section className="relative pt-28 md:pt-32 pb-20 px-4 text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/69024ff63e45dff7220e5931.png"
          alt="AO Liquidation Warehouse"
          fill
          className="object-cover object-center"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(11,34,50,0.88) 0%, rgba(22,54,74,0.78) 50%, rgba(10,30,45,0.9) 100%)",
          }}
        />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-full px-4 py-1.5 mb-6 text-xs md:text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Valoración gratuita con un agente AO
          </div>

          <h1 className="text-3xl md:text-6xl font-bold mb-5 leading-tight">
            Convierte tu negocio en un{" "}
            <span className="bg-gradient-to-r from-amber-300 to-amber-100 bg-clip-text text-transparent">
              caso de éxito
            </span>{" "}
            con pallets de liquidación
          </h1>

          <p className="text-base md:text-xl text-white/85 leading-relaxed max-w-3xl mx-auto mb-8">
            Hablemos 15 minutos. Un agente AO te escucha, entiende tu modelo de
            negocio y te muestra cuál de nuestros programas calza con lo que
            estás vendiendo hoy.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm md:text-base text-white/80">
            <span className="inline-flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-amber-300" />
              Llamada de 10–15 min
            </span>
            <span className="hidden md:inline text-white/30">•</span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
              Sin compromiso de compra
            </span>
            <span className="hidden md:inline text-white/30">•</span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              Agente humano, no chatbot
            </span>
          </div>

          <Link
            href="/valoracion/agendar"
            className="inline-flex items-center justify-center mt-10 bg-amber-400 hover:bg-amber-300 text-brand-dark font-semibold px-8 py-4 rounded-xl shadow-xl shadow-amber-500/20 transition-colors"
          >
            Reservar mi valoración
          </Link>
        </div>
      </div>
    </section>
  );
}
