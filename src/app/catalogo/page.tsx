import CatalogClient from "@/components/catalogo/CatalogClient";
import { getPublicProducts } from "@/lib/products";

// Los productos los administra el admin (ocultar/estado); servimos siempre fresco
// para que los cambios se reflejen de inmediato. Sigue siendo SSR (bueno para SEO).
export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const products = await getPublicProducts();

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
            Catálogo de Pallets
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explora nuestra amplia selección de pallets de liquidación
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">
              Pronto publicaremos nuevos pallets. Vuelve a visitarnos.
            </p>
          </div>
        ) : (
          <CatalogClient products={products} />
        )}
      </div>
    </div>
  );
}
