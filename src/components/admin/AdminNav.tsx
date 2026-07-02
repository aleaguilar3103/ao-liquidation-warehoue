"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin/productos", label: "Productos", icon: Package },
  {
    href: "/admin/contenido",
    label: "Calendario de Contenido",
    icon: CalendarDays,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="inline-flex flex-wrap gap-1 p-1 bg-gray-100 rounded-xl">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition",
              active
                ? "bg-white text-brand shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/60",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
