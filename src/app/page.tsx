import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import BrandsSection from "@/components/home/BrandsSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import MissionVisionSection from "@/components/home/MissionVisionSection";
import OrganizationSection from "@/components/home/OrganizationSection";
import TrustSection from "@/components/home/TrustSection";

export default function Page() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <BrandsSection />
      <FeaturedProducts />
      <MissionVisionSection />
      <OrganizationSection />
      <TrustSection />
    </main>
  );
}
