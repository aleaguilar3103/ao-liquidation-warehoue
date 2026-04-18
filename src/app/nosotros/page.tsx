import BlockedPage from "@/components/BlockedPage";

export default function NosotrosPage() {
  return <BlockedPage />;
}

/*
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Users,
  Package,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import FeaturedProducts from "@/components/home/FeaturedProducts";

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
              Sobre Nosotros
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Tu socio confiable en el negocio de liquidación mayorista
            </p>
          </div>

          <div className="space-y-12">
            <section className="bg-gradient-to-br from-brand/5 to-white p-8 rounded-2xl border-2 border-brand/20">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Nuestra Historia
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                ¡Descubrí la mejor forma de comprar lotes y pallets en Costa
                Rica! Ofrecemos productos 100% vírgenes, precios de liquidación
                y stock renovado constantemente. Comprá fácil, seguro y obtené
                el máximo valor por tu dinero.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Liquidation Warehouse, tu distribuidor confiable para
                revendedores y emprendedores en toda Latinoamérica.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                ¿Qué encontrarás en Liquidation Warehouse?
              </h3>
              <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
                Con más de <strong>15 años de experiencia</strong>, ofrecemos{" "}
                <strong>lotes, pallets y contenedores 100% vírgenes</strong>{" "}
                cargados con productos de excelente calidad a precios de
                liquidación.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-brand/20 hover:shadow-xl transition-shadow text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Transparencia
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Relaciones honestas y de confianza, sin márgenes ocultos.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-brand/20 hover:shadow-xl transition-shadow text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Variedad
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Electrónica, hogar, juguetes, ropa, calzado, tecnología y
                    más en un solo lugar.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-brand/20 hover:shadow-xl transition-shadow text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Precios Justos
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Pagás solo una fracción del valor real, sin sorpresas.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-brand/20 hover:shadow-xl transition-shadow text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Crecimiento
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Nuestro éxito depende del tuyo: llevamos tu negocio al
                    siguiente nivel.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-gray-50 to-white p-10 rounded-2xl border-2 border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                Emprendedor, revendedor o empresario
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Estamos listos para hacer crecer tu proyecto 🚀
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-brand mb-2 break-words px-2">15+</div>
                  <div className="text-sm text-gray-600">Años de experiencia</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-brand mb-2 break-words px-2">100%</div>
                  <div className="text-sm text-gray-600">Productos vírgenes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-brand mb-2 break-words px-2">Miles</div>
                  <div className="text-sm text-gray-600">De clientes satisfechos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-brand mb-2 break-words px-2">Latinoamérica</div>
                  <div className="text-sm text-gray-600">Distribución en la región</div>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-brand to-brand-dark text-white p-10 rounded-2xl text-center">
              <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
              <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                Únete a cientos de mayoristas que confían en nosotros para hacer
                crecer sus negocios
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-brand hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
              >
                <a
                  href="https://wa.link/pg0nbh"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 w-5 h-5" />
                  Contáctanos por WhatsApp
                </a>
              </Button>
            </section>
          </div>
        </div>
      </div>
      <FeaturedProducts />
    </div>
  );
}
*/