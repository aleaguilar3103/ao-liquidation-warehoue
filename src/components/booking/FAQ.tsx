"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "¿La valoración tiene costo?",
    a: "No. Es completamente gratis y sin compromiso. La hacemos para entender tu negocio y decirte con honestidad si nuestros programas calzan o no contigo.",
  },
  {
    q: "¿Es una visita al almacén?",
    a: "No. La valoración es una llamada de 10 a 15 minutos con un agente. Si ambos vemos que tiene sentido seguir, ahí mismo el agente coordina contigo los siguientes pasos.",
  },
  {
    q: "¿Necesito tener un negocio formal?",
    a: "No necesariamente. Trabajamos con tiendas físicas, ecommerce, revendedores, bazares y emprendedores que están arrancando. La idea es entender dónde estás y a dónde quieres llegar.",
  },
  {
    q: "¿En qué moneda y formato vienen los lotes?",
    a: "Los programas se cotizan en dólares (USD). Manejamos lotes, pallets y contenedores 100% vírgenes con mercancía de Walmart, Amazon, Target, Costco y otros minoristas de EE. UU.",
  },
  {
    q: "¿Hacen envíos a todo Costa Rica?",
    a: "Sí. Coordinamos la logística desde nuestro almacén hasta cualquier punto del país. Los detalles los conversamos en la valoración.",
  },
];

export default function FAQ() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <span className="text-brand font-semibold text-sm uppercase tracking-wider">
            Preguntas frecuentes
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Lo que muchos nos preguntan antes de agendar
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-2 border-gray-100 rounded-xl px-5 data-[state=open]:border-brand/30 data-[state=open]:bg-brand/5 transition-colors"
            >
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
