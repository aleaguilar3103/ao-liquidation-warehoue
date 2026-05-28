import { MapPin, PhoneCall, RefreshCw, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: PhoneCall,
    step: "01",
    title: "Hablemos",
    body:
      "Una valoración de 10–15 minutos con un agente humano, no chatbot. Entendemos tu negocio y vemos qué programa calza con vos.",
  },
  {
    icon: MapPin,
    step: "02",
    title: "Coordinamos una visita",
    body:
      "Si todo hace sentido, el agente coordina directamente contigo una visita para que veas la mercancía de cerca.",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Hacés crecer tu negocio",
    body:
      "Te llevás tu lote, pallet o contenedor y empezás a vender. Nosotros seguimos como tu proveedor constante.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <span className="text-brand font-semibold text-sm uppercase tracking-wider">
            Cómo funciona
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
            Tres pasos. Sin enredos.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            La valoración es para entender tu negocio y ver cuál de nuestros
            programas tiene más sentido. Sin compromiso de compra.
          </p>
        </div>

        <div className="relative">
          {/* línea decorativa */}
          <div className="hidden md:block absolute top-24 left-[12%] right-[12%] h-px bg-gradient-to-r from-brand/0 via-brand/30 to-brand/0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
            {steps.map(({ icon: Icon, step, title, body }) => (
              <div
                key={step}
                className="group relative p-7 md:p-8 rounded-3xl bg-white border-2 border-gray-100 hover:border-brand/30 hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-5xl font-black text-gray-100 group-hover:text-brand/15 transition-colors leading-none">
                    {step}
                  </div>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Indicador de que el proceso se repite */}
        <div className="mt-10 flex justify-center">
          <div className="group inline-flex items-center gap-3 bg-brand/5 border border-brand/15 rounded-full pl-4 pr-5 py-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-dark shadow-md shadow-brand/20">
              <RefreshCw className="w-4 h-4 text-white group-hover:rotate-180 transition-transform duration-500" />
            </span>
            <span className="text-sm md:text-base font-semibold text-brand">
              …y repetimos. Reabastecés y tu negocio sigue creciendo.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
