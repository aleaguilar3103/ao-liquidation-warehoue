import type { Metadata } from "next";

import BrandsMarquee from "@/components/booking/BrandsMarquee";
import CategoriesGrid from "@/components/booking/CategoriesGrid";
import CTASection from "@/components/booking/CTASection";
import FAQ from "@/components/booking/FAQ";
import HowItWorks from "@/components/booking/HowItWorks";
import Programs from "@/components/booking/Programs";
import ValoracionHero from "@/components/booking/ValoracionHero";

export const metadata: Metadata = {
  title: "Agendá tu valoración gratuita",
  description:
    "Llamada de 10–15 minutos con un agente AO Liquidation Warehouse para entender tu negocio y mostrarte qué programa de pallets calza mejor con vos.",
  openGraph: {
    title: "Agendá tu valoración gratuita | AO Liquidation Warehouse",
    description:
      "Hablemos 15 minutos. Un agente AO te escucha, entiende tu negocio y te muestra cuál de nuestros programas de liquidación calza con lo que estás vendiendo hoy.",
  },
};

export default function ValoracionPage() {
  return (
    <main>
      <ValoracionHero />
      <BrandsMarquee />
      <Programs />
      <CategoriesGrid />
      <HowItWorks />
      <CTASection />
      <FAQ />
    </main>
  );
}
