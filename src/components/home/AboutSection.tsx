import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-brand to-brand-dark text-white">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Sobre Liquidation Warehouse
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Somos líderes en la distribución mayorista de pallets de liquidación, 
            conectando negocios con oportunidades excepcionales. Con años de experiencia 
            en la industria, ofrecemos productos de calidad de las mejores marcas a precios 
            competitivos para mayoristas.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-brand hover:bg-white/90 px-8 py-6 text-lg font-semibold"
          >
            <Link href="/nosotros">
              Conoce Más
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}