import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative pt-20 px-4 text-white overflow-hidden min-h-[80vh] flex items-center">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/69024ff63e45dff7220e5931.png"
          alt="Liquidation Warehouse"
          fill
          className="object-cover object-center"
          style={{ objectPosition: 'center center' }}
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(11,34,50,0.75) 0%, rgba(22,54,74,0.65) 50%, rgba(10,30,45,0.75) 100%)",
          }}
        />
      </div>
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight uppercase">
            SU PROVEEDOR OFICIAL DE MERCANCÍA DE LIQUIDACIÓN PREMIUM en costa
            rica
          </h1>

          <p className="text-base md:text-2xl mb-6 md:mb-8 text-white/90 leading-relaxed">
            Establezca una relación sólida con su fuente directa de pallets y
            contenedores de grandes minoristas de EE. UU.
          </p>

          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-brand to-brand-dark hover:from-brand-dark hover:to-brand text-white px-6 md:px-8 py-4 md:py-6 text-base md:text-lg shadow-xl font-semibold"
          >
            <a
              href="https://wa.link/zvmnhy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-2 w-4 h-4 md:w-5 md:h-5" />
              HABLAR POR WHATSAPP
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}