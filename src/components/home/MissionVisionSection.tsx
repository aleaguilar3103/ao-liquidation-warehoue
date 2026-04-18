import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, ArrowRight } from "lucide-react";

export default function MissionVisionSection() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
          Nuestra Misión y Visión
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Misión */}
          <Card className="border-2 border-brand/20 shadow-lg bg-white">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-dark rounded-full flex items-center justify-center mr-3">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Misión</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Ayudamos a emprendedores, revendedores y negocios en crecimiento a acceder a productos de calidad a precios de liquidación, con transparencia y acompañamiento real para que crezcan con seguridad y confianza.
              </p>
            </CardContent>
          </Card>

          {/* Visión */}
          <Card className="border-2 border-brand/20 shadow-lg bg-white">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-dark rounded-full flex items-center justify-center mr-3">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Visión</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Transformar el acceso a mercadería de liquidación en Latinoamérica creando una red de mayoristas independientes con acceso directo, sin intermediarios y con procesos claros para escalar sus negocios.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button
            asChild
            variant="outline"
            className="border-2 border-brand text-brand hover:bg-brand hover:text-white"
          >
            <Link href="/mision-vision">
              Ver más
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
