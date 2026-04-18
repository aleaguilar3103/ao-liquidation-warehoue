import BlockedPage from "@/components/BlockedPage";

export default function CatalogoPage() {
  return <BlockedPage />;
}

// TEMP BLOCKED - original below
/*
import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/products";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/products";

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    }
    loadProducts();
  }, []);

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))];
  
  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20 px-4 flex items-center justify-center">
        <p className="text-xl text-gray-600">Cargando productos...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

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

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              className={
                selectedCategory === category
                  ? "bg-gradient-to-r from-brand to-brand-dark text-white"
                  : "border-brand text-brand hover:bg-brand/5"
              }
            >
              {category === "all" ? "Todos" : category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              No se encontraron productos en esta categoría.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
*/