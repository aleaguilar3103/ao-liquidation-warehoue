"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Package, ZoomIn, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Product } from "@/lib/products";
import { useState } from "react";

interface ProductModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductModal({
  product,
  open,
  onOpenChange,
}: ProductModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  
  const allImages = [product.image_url, ...(product.additional_images || [])];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const openImageViewer = () => {
    setImageViewerOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent pr-8">
              {product.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 md:space-y-6 overflow-x-hidden">
            {/* Main Image with Navigation */}
            <div className="relative w-full">
              <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden bg-gray-100 group">
                <Image
                  src={allImages[currentImageIndex]}
                  alt={product.title}
                  fill
                  className="object-contain"
                />
                
                {/* Zoom Button */}
                <button
                  onClick={openImageViewer}
                  className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"
                >
                  <ZoomIn className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                {/* Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 md:p-2 rounded-full transition"
                    >
                      <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 md:p-2 rounded-full transition"
                    >
                      <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails - Grid layout instead of horizontal scroll */}
              {allImages.length > 1 && (
                <div className="w-full mt-3 md:mt-4">
                  <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {allImages.slice(0, 8).map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition ${
                          currentImageIndex === index
                            ? "border-brand shadow-lg"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.title} - ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                  {allImages.length > 8 && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      +{allImages.length - 8} imágenes más
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-gradient-to-r from-brand to-brand-dark text-white text-xs md:text-sm px-3 md:px-4 py-1">
                {product.category}
              </Badge>
              
              <Badge className={product.available ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                {product.available ? "Disponible" : "No Disponible"}
              </Badge>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                Descripción
              </h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="bg-brand/5 p-3 md:p-4 rounded-lg border border-brand/20">
                <div className="flex items-center mb-2">
                  <Package className="w-4 h-4 md:w-5 md:h-5 text-brand mr-2" />
                  <h4 className="font-semibold text-gray-900 text-sm md:text-base">Precio</h4>
                </div>
                <Button
                  asChild
                  variant="link"
                  className="p-0 h-auto text-brand hover:text-brand-dark font-semibold text-sm md:text-base"
                >
                  <a href="/contacto">Cotizar</a>
                </Button>
              </div>

              {product.quantity > 0 && (
                <div className="bg-brand/5 p-3 md:p-4 rounded-lg border border-brand/20">
                  <div className="flex items-center mb-2">
                    <Package className="w-4 h-4 md:w-5 md:h-5 text-brand mr-2" />
                    <h4 className="font-semibold text-gray-900 text-sm md:text-base">Cantidad</h4>
                  </div>
                  <p className="text-gray-600 text-sm md:text-base">{product.quantity} pallets disponibles</p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-brand/5 to-white p-4 md:p-6 rounded-lg border-2 border-brand/20">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                ¿Interesado en este pallet?
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-4">
                Contáctanos por WhatsApp para obtener más información y precios mayoristas.
              </p>
              <Button
                asChild
                size="lg"
                className="w-full bg-gradient-to-r from-brand to-brand-dark hover:from-brand-dark hover:to-brand text-white"
              >
                <a
                  href="https://wa.link/pg0nbh"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 w-4 h-4 md:w-5 md:h-5" />
                  Contactar por WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Screen Image Viewer */}
      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] bg-black/95 border-none p-0 overflow-hidden">
          <button
            onClick={() => setImageViewerOpen(false)}
            className="absolute top-2 right-2 md:top-4 md:right-4 z-50 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
            <img
              src={allImages[currentImageIndex]}
              alt={product.title}
              className="max-h-full max-w-full object-contain"
            />
            
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 md:p-3 rounded-full transition"
                >
                  <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 md:p-3 rounded-full transition"
                >
                  <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                </button>
                
                <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 bg-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-white text-sm md:text-base">
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