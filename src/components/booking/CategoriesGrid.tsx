"use client";

import {
  Baby,
  Hammer,
  Home,
  Laptop,
  Refrigerator,
  Shirt,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

const categories = [
  { icon: Refrigerator, label: "Electrodomésticos", color: "from-sky-100 to-sky-50", iconColor: "text-sky-600" },
  { icon: Home, label: "Hogar y muebles", color: "from-amber-100 to-amber-50", iconColor: "text-amber-600" },
  { icon: Laptop, label: "Tecnología", color: "from-violet-100 to-violet-50", iconColor: "text-violet-600" },
  { icon: Hammer, label: "Herramientas", color: "from-orange-100 to-orange-50", iconColor: "text-orange-600" },
  { icon: Baby, label: "Juguetes / Niños", color: "from-rose-100 to-rose-50", iconColor: "text-rose-600" },
  { icon: Shirt, label: "Ropa y calzado", color: "from-emerald-100 to-emerald-50", iconColor: "text-emerald-600" },
  { icon: Sparkles, label: "Belleza", color: "from-pink-100 to-pink-50", iconColor: "text-pink-600" },
  { icon: ShoppingBag, label: "Variedad / Mixto", color: "from-slate-100 to-slate-50", iconColor: "text-slate-700" },
];

export default function CategoriesGrid() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-50/50 to-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <span className="text-brand font-semibold text-sm uppercase tracking-wider">
            Categorías
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
            Lo que vas a encontrar en cada pallet
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cada lote es diferente, pero estas son las categorías que rotan
            semana a semana en nuestro almacén.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {categories.map(({ icon: Icon, label, color, iconColor }) => (
            <div
              key={label}
              className="group p-5 md:p-6 rounded-2xl bg-white border border-gray-100 hover:border-brand/30 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-default"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
              >
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <div className="font-semibold text-gray-900 text-sm md:text-base">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
