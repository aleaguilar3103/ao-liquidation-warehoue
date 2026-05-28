"use client";

import Image from "next/image";

const brands = [
  {
    name: "Walmart",
    logo: "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/68df441bc268b13dec4f7c9d.png",
  },
  {
    name: "Amazon",
    logo: "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/68df441bbb793ac7c64a049f.png",
  },
  {
    name: "Target",
    logo: "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/68df441b142b71af17a405a7.png",
  },
  {
    name: "Costway",
    logo: "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/68df441b142b711ddfa405a6.png",
  },
  {
    name: "Costco",
    logo: "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/68df441b5a4d7f3cfcb583a6.png",
  },
];

const duplicated = [...brands, ...brands, ...brands];

export default function BrandsMarquee() {
  return (
    <section className="relative -mt-10 md:-mt-12 mb-4 px-4 z-20">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-gradient-to-r from-[#1e3a5f] via-[#26466f] to-[#1e3a5f] rounded-2xl shadow-2xl shadow-brand/30 py-6 md:py-8 px-4 overflow-hidden border border-white/10">
          <div className="text-center text-xs md:text-sm uppercase tracking-[0.2em] font-semibold text-amber-300 mb-4">
            Mercancía de las marcas más vendidas de EE. UU.
          </div>
          <div className="relative flex items-center">
            <div className="flex animate-[scroll_25s_linear_infinite] hover:[animation-play-state:paused] gap-10 md:gap-16">
              {duplicated.map((brand, index) => (
                <div
                  key={`${brand.name}-${index}`}
                  className="relative h-10 w-24 md:h-14 md:w-36 flex-shrink-0 opacity-90 hover:opacity-100 transition-opacity"
                >
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
  );
}
