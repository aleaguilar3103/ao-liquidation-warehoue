import HeroSection from "@/components/home/HeroSection";
import BrandsSection from "@/components/home/BrandsSection";
import AboutSection from "@/components/home/AboutSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import MissionVisionSection from "@/components/home/MissionVisionSection";
import OrganizationSection from "@/components/home/OrganizationSection";
import TrustSection from "@/components/home/TrustSection";

// FeaturedProducts lee de Supabase en el server; servimos fresco para reflejar
// de inmediato los cambios del admin (visibilidad/estado).
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main>
      <HeroSection />
      <BrandsSection />
      <AboutSection />
      <FeaturedProducts />
      <MissionVisionSection />
      <OrganizationSection />
      <TrustSection />
    </main>
  );
}
