import Link from "next/link";
import { Package, CalendarDays } from "lucide-react";

export default function AdminHome() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-extrabold text-[#0F233F]">
        Panel de Administración
      </h1>
      <p className="mt-1 text-sm text-[#6B7280]">
        Gestiona el catálogo y el plan de contenido.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Link
          href="/admin/productos"
          className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-colors hover:border-[#0F233F]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F233F] text-white">
            <Package className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-bold text-[#0F233F]">Productos</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Crear, editar y publicar el catálogo.
          </p>
        </Link>
        <Link
          href="/admin/contenido"
          className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-colors hover:border-[#0F233F]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E11D27] text-white">
            <CalendarDays className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-bold text-[#0F233F]">Contenido</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Planificar el calendario de contenido.
          </p>
        </Link>
      </div>
    </main>
  );
}
