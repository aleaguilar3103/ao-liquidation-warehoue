"use client";

import Image from "next/image";

export default function BrandsSection() {
  const desktopBrands = [
    {
      name: "Walmart",
      logo: "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/68df441bc268b13dec4f7c9d.png"
    },
    {
      name: "Amazon",
      logo: "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/68df441bbb793ac7c64a049f.png"
    },
    {
      name: "Target",
      logo: "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/68df441b142b71af17a405a7.png"
    },
    {
      name: "Costway",
      logo: "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/68df441b142b711ddfa405a6.png"
    },
    {
      name: "Costco",
      logo: "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/68df441b5a4d7f3cfcb583a6.png"
    }
  ];

  const mobileBrands = [
    "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/69025402c8776c53a85ded33.png",
    "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/69025402e4eb0b7feeea2c19.png",
    "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/69025403df45432673b72d71.png",
    "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/6902540210e460c2c122cf65.png",
    "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/690254023e45df57970f9a6c.png",
    "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/690254029629bf1a83013cb9.png",
    "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/690254023e45df54aa0f9a6b.png"
  ];

  const duplicatedDesktop = [...desktopBrands, ...desktopBrands];
  const duplicatedMobile = [...mobileBrands, ...mobileBrands];

  return (
    <>
      {/* Desktop version */}
      <section className="hidden md:block relative -mt-12 mb-12 px-4 z-10">
        <div className="container mx-auto w-[90%]">
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] rounded-2xl shadow-2xl py-10 px-8 overflow-hidden">
            <div className="relative flex items-center">
              <div className="flex animate-[scroll_20s_linear_infinite] hover:[animation-play-state:paused] gap-16">
                {duplicatedDesktop.map((brand, index) => (
                  <div key={`${brand.name}-${index}`} className="relative h-20 w-48 flex-shrink-0 opacity-90">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      className="object-contain filter brightness-0 invert"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile version - full width */}
      <section className="md:hidden relative -mt-12 mb-12 z-10">
        <div className="w-full">
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] shadow-2xl py-8 overflow-hidden">
            <div className="relative flex items-center">
              <div className="flex animate-[scroll_15s_linear_infinite] gap-8">
                {duplicatedMobile.map((logo, index) => (
                  <div key={index} className="relative h-12 w-20 flex-shrink-0 opacity-90">
                    <Image
                      src={logo}
                      alt={`Brand ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}