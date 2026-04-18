import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Image from "next/image";

export default function OrganizationSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Texto */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Estableciendo el Estándar de Organización en Liquidaciones
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Nuestro enfoque no es la venta rápida, sino la organización y el control de calidad. Solo así podemos ser el socio que su negocio necesita para crecer de manera estable y predecible.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-brand flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Asesorías Personalizadas para tu Negocio
                  </h3>
                  <p className="text-gray-600">
                    Te acompañamos en cada etapa del proceso de compra para maximizar la rentabilidad de tu inversión. Nuestro equipo analiza tus necesidades y te guía en la selección de los lotes que mejor se adaptan al tipo de negocio que manejas.
                  </p>
                </div>
              </div>
            </div>

            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-brand to-brand-dark hover:from-brand-dark hover:to-brand text-white px-8 py-6 text-lg shadow-lg font-semibold"
            >
              <a
                href="https://wa.link/zvmnhy"
                target="_blank"
                rel="noopener noreferrer"
              >
                HABLAR CON UN REPRESENTANTE
              </a>
            </Button>
          </div>

          {/* Imagen */}
          <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/68edd62fa90320c7397c6af4.jpeg"
              alt="Organización de almacén"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}