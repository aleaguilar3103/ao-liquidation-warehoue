"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Package,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
} from "lucide-react";
import type { Product } from "@/lib/products";
import { useCallback, useEffect, useState } from "react";

interface ProductModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WHATSAPP_URL = "https://wa.link/pg0nbh";

export default function ProductModal({
  product,
  open,
  onOpenChange,
}: ProductModalProps) {
  const allImages = [
    product.image_url,
    ...(product.additional_images || []),
  ].filter(Boolean);
  const hasImages = allImages.length > 0;
  const hasMultipleImages = allImages.length > 1;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setCurrentImageIndex(0);
      setZoomOpen(false);
    }
  }, [open]);

  const nextImage = useCallback(() => {
    if (!hasMultipleImages) return;
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length, hasMultipleImages]);

  const prevImage = useCallback(() => {
    if (!hasMultipleImages) return;
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length,
    );
  }, [allImages.length, hasMultipleImages]);

  useEffect(() => {
    if (!zoomOpen || !hasMultipleImages) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [zoomOpen, hasMultipleImages, nextImage, prevImage]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[92vh] overflow-y-auto bg-white p-0">
          <div className="p-5 md:p-7">
            <DialogHeader className="mb-4 pr-10">
              <DialogTitle className="text-2xl md:text-3xl font-bold text-brand">
                {product.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Detalles, galería e información para cotizar este pallet.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7">
              <div className="space-y-3">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  {hasImages ? (
                    <>
                      <Image
                        src={allImages[currentImageIndex]}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 95vw, 50vw"
                        className="object-contain"
                        priority
                      />

                      <button
                        type="button"
                        onClick={() => setZoomOpen(true)}
                        aria-label="Ampliar imagen"
                        className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition shadow"
                      >
                        <ZoomIn className="w-4 h-4 md:w-5 md:h-5" />
                      </button>

                      {hasMultipleImages && (
                        <>
                          <button
                            type="button"
                            onClick={prevImage}
                            aria-label="Imagen anterior"
                            className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition shadow"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={nextImage}
                            aria-label="Imagen siguiente"
                            className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition shadow"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>

                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs md:text-sm px-3 py-1 rounded-full">
                            {currentImageIndex + 1} / {allImages.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                      <Package className="w-12 h-12 mb-2" />
                      <span className="text-sm">Sin imagen disponible</span>
                    </div>
                  )}
                </div>

                {hasMultipleImages && (
                  <div className="grid grid-cols-5 gap-2">
                    {allImages.slice(0, 5).map((img, index) => (
                      <button
                        type="button"
                        key={`${img}-${index}`}
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`Ver imagen ${index + 1}`}
                        aria-current={currentImageIndex === index}
                        className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition ${
                          currentImageIndex === index
                            ? "border-brand ring-2 ring-brand/30"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.title} miniatura ${index + 1}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                        {index === 4 && allImages.length > 5 && (
                          <div className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-xs font-semibold">
                            +{allImages.length - 5}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-brand text-white text-xs md:text-sm px-3 py-1">
                    {product.category}
                  </Badge>
                  <Badge
                    className={
                      product.available
                        ? "bg-green-600 text-white"
                        : "bg-red-500 text-white"
                    }
                  >
                    {product.available ? "Disponible" : "No disponible"}
                  </Badge>
                </div>

                {product.description && (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-1">
                      Descripción
                    </h3>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {product.quantity > 0 && (
                    <div className="bg-brand/5 p-3 rounded-lg border border-brand/15">
                      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide mb-1">
                        <Package className="w-4 h-4" /> Pallets
                      </div>
                      <p className="text-gray-900 font-semibold text-lg">
                        {product.quantity}
                      </p>
                    </div>
                  )}
                  {product.units_per_pallet > 0 && (
                    <div className="bg-brand/5 p-3 rounded-lg border border-brand/15">
                      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide mb-1">
                        <Layers className="w-4 h-4" /> Unidades por pallet
                      </div>
                      <p className="text-gray-900 font-semibold text-lg">
                        {product.units_per_pallet}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-auto bg-gradient-to-br from-brand/10 to-white p-4 md:p-5 rounded-xl border border-brand/20">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">
                    ¿Te interesa este pallet?
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Contáctanos por WhatsApp para precios mayoristas e
                    información detallada.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    disabled={!product.available}
                    className="w-full bg-gradient-to-r from-brand to-brand-dark hover:from-brand-dark hover:to-brand text-white"
                  >
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 w-4 h-4 md:w-5 md:h-5" />
                      {product.available
                        ? "Contactar por WhatsApp"
                        : "Producto no disponible"}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent
          hideClose
          className="max-w-[100vw] sm:max-w-[100vw] w-screen h-screen bg-black/95 border-none p-0 rounded-none sm:rounded-none"
        >
          <DialogTitle className="sr-only">{product.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Vista ampliada de la imagen del producto.
          </DialogDescription>

          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Cerrar vista ampliada"
            className="absolute top-3 right-3 md:top-5 md:right-5 z-50 bg-white/10 hover:bg-white/25 text-white p-2 rounded-full transition"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-10">
            {hasImages && (
              <img
                src={allImages[currentImageIndex]}
                alt={product.title}
                className="max-h-full max-w-full object-contain select-none"
                draggable={false}
              />
            )}

            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  aria-label="Imagen anterior"
                  className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-2 md:p-3 rounded-full transition"
                >
                  <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  aria-label="Imagen siguiente"
                  className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-2 md:p-3 rounded-full transition"
                >
                  <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                </button>

                <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 bg-white/10 text-white text-sm md:text-base px-3 py-1.5 rounded-full">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
