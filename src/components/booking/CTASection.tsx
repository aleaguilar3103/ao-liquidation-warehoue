import { ArrowRight, CalendarClock, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand to-brand-dark p-8 md:p-14 text-center text-white shadow-2xl shadow-brand/30">
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-300/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 mb-5 text-xs md:text-sm font-medium">
              <CalendarClock className="w-4 h-4 text-amber-300" />
              Reservá en menos de 1 minuto
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-5 leading-tight">
              Listo para hablar 15 min con{" "}
              <span className="bg-gradient-to-r from-amber-300 to-amber-100 bg-clip-text text-transparent">
                un agente AO
              </span>
              ?
            </h2>

            <p className="text-base md:text-lg text-white/85 max-w-2xl mx-auto mb-8">
              Te toma alrededor de 45 segundos llenar el formulario. Después
              elegís el horario que mejor te queda y listo.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/valoracion/agendar"
                className="group inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-brand-dark font-bold px-8 py-4 rounded-xl shadow-2xl shadow-amber-500/30 transition-colors text-base md:text-lg"
              >
                Agendar mi valoración gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="inline-flex items-center gap-2 text-sm text-white/80">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                Sin compromiso de compra
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
