"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  Product,
} from "@/lib/products";
import { uploadProductImage } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Package,
  Layers,
  Star,
  Grid3x3,
  RefreshCw,
  Grid,
  List,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRODUCT_STATUSES,
  getStatusConfig,
  DEFAULT_STATUS,
  type ProductStatus,
} from "@/lib/product-status";
import { AdminNav } from "@/components/admin/AdminNav";

interface FormData {
  title: string;
  category: string;
  description: string;
  quantity: number;
  units_per_pallet: number;
  featured: boolean;
  status: ProductStatus;
  is_visible: boolean;
}

const EMPTY_FORM: FormData = {
  title: "",
  category: "",
  description: "",
  quantity: 0,
  units_per_pallet: 0,
  featured: false,
  status: DEFAULT_STATUS,
  is_visible: true,
};

export default function AdminProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentProductImages, setCurrentProductImages] = useState<string[]>(
    [],
  );

  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setRefreshing(true);
    const data = await getProducts();
    setProducts(data);
    setRefreshing(false);
  };

  const resetForm = useCallback(() => {
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setMainImage(null);
    setAdditionalImages([]);
    setMainImagePreview("");
    setAdditionalPreviews([]);
  }, []);

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      // Defer reset so closing animation doesn't show empty content first
      setTimeout(resetForm, 200);
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
    e.target.value = "";
  };

  const handleAdditionalImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setAdditionalImages((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setAdditionalPreviews((prev) => [...prev, ...previews]);
    e.target.value = "";
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeMainImage = () => {
    setMainImage(null);
    setMainImagePreview("");
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      category: product.category,
      description: product.description,
      quantity: product.quantity,
      units_per_pallet: product.units_per_pallet,
      featured: product.featured,
      status: product.status ?? DEFAULT_STATUS,
      is_visible: product.is_visible ?? true,
    });
    setMainImage(null);
    setAdditionalImages([]);
    setMainImagePreview(product.image_url);
    setAdditionalPreviews(product.additional_images || []);
    setDialogOpen(true);
  };

  const openNewProduct = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.category.trim()) {
      toast({
        title: "Faltan datos",
        description: "El título y la categoría son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    if (!editingProduct && !mainImage) {
      toast({
        title: "Imagen requerida",
        description: "Debes subir una imagen principal para el producto.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let mainImageUrl = editingProduct?.image_url || "";

      if (mainImage) {
        const url = await uploadProductImage(mainImage);
        if (url) mainImageUrl = url;
      }

      if (!mainImageUrl) {
        throw new Error("No se pudo obtener la imagen principal.");
      }

      const additionalImageUrls: string[] = [];

      if (editingProduct) {
        const existingUrls = editingProduct.additional_images || [];
        existingUrls.forEach((url) => {
          if (additionalPreviews.includes(url)) {
            additionalImageUrls.push(url);
          }
        });
      }

      for (const file of additionalImages) {
        const url = await uploadProductImage(file);
        if (url) additionalImageUrls.push(url);
      }

      const productData = {
        ...formData,
        title: formData.title.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        image_url: mainImageUrl,
        additional_images: additionalImageUrls,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast({
          title: "Producto actualizado",
          description: "Los cambios se guardaron correctamente.",
        });
      } else {
        await addProduct(productData);
        toast({
          title: "Producto creado",
          description: "El producto se agregó al catálogo.",
        });
      }

      handleDialogOpenChange(false);
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Hubo un error al guardar el producto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const success = await deleteProduct(deleteTarget.id);
    setDeleting(false);

    if (success) {
      toast({
        title: "Producto eliminado",
        description: `"${deleteTarget.title}" se eliminó correctamente.`,
      });
      setDeleteTarget(null);
      fetchProducts();
    } else {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto.",
        variant: "destructive",
      });
    }
  };

  const toggleVisibility = async (product: Product) => {
    const success = await updateProduct(product.id, {
      is_visible: !product.is_visible,
    });
    if (success) {
      toast({
        title: "Visibilidad actualizada",
        description: `"${product.title}" ahora está ${
          !product.is_visible ? "visible" : "oculto"
        }.`,
      });
      fetchProducts();
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar la visibilidad.",
        variant: "destructive",
      });
    }
  };

  const openImageViewer = (product: Product, startIndex: number = 0) => {
    const allImages = [
      product.image_url,
      ...(product.additional_images || []),
    ].filter(Boolean);
    if (!allImages.length) return;
    setCurrentProductImages(allImages);
    setCurrentImageIndex(startIndex);
    setImageViewerOpen(true);
  };

  const nextImage = useCallback(() => {
    setCurrentImageIndex(
      (prev) => (prev + 1) % currentProductImages.length,
    );
  }, [currentProductImages.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex(
      (prev) =>
        (prev - 1 + currentProductImages.length) %
        currentProductImages.length,
    );
  }, [currentProductImages.length]);

  useEffect(() => {
    if (!imageViewerOpen || currentProductImages.length <= 1) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [imageViewerOpen, currentProductImages.length, nextImage, prevImage]);

  const totalProducts = products.length;
  const totalPallets = products.reduce((sum, p) => sum + p.quantity, 0);
  const featuredProducts = products.filter((p) => p.featured).length;
  const categories = new Set(products.map((p) => p.category)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4 pt-32">
      <Toaster />

      {/* Fullscreen Image Viewer */}
      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent
          hideClose
          className="max-w-[100vw] sm:max-w-[100vw] w-screen h-screen bg-black/95 border-none p-0 rounded-none sm:rounded-none"
        >
          <DialogTitle className="sr-only">Vista de imagen</DialogTitle>
          <DialogDescription className="sr-only">
            Visor de imagen ampliada.
          </DialogDescription>

          <button
            type="button"
            onClick={() => setImageViewerOpen(false)}
            aria-label="Cerrar visor"
            className="absolute top-3 right-3 md:top-5 md:right-5 z-50 bg-white/10 hover:bg-white/25 text-white p-2 rounded-full transition"
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-10">
            {currentProductImages[currentImageIndex] && (
              <img
                src={currentProductImages[currentImageIndex]}
                alt="Vista ampliada del producto"
                className="max-h-full max-w-full object-contain select-none"
                draggable={false}
              />
            )}

            {currentProductImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  aria-label="Imagen anterior"
                  className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-2 md:p-3 rounded-full transition"
                >
                  <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  aria-label="Imagen siguiente"
                  className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-2 md:p-3 rounded-full transition"
                >
                  <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                </button>

                <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 bg-white/10 text-white text-sm md:text-base px-3 py-1.5 rounded-full">
                  {currentImageIndex + 1} / {currentProductImages.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que deseas eliminar{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget?.title}
              </span>
              ? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Product Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4">
            <DialogHeader className="pr-10">
              <DialogTitle className="text-2xl text-brand">
                {editingProduct ? "Editar producto" : "Nuevo producto"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? "Actualiza la información del producto seleccionado."
                  : "Completa los campos para agregar un producto al catálogo."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">
                  Título <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="Ej: Pallet de Electrónicos"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">
                  Categoría <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="category"
                  list="categorias-existentes"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                  placeholder="Ej: Electrónicos"
                />
                <datalist id="categorias-existentes">
                  {Array.from(new Set(products.map((p) => p.category)))
                    .filter(Boolean)
                    .map((c) => (
                      <option key={c} value={c} />
                    ))}
                </datalist>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quantity">Cantidad de pallets</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={0}
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: Math.max(0, parseInt(e.target.value) || 0),
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="units">Unidades por pallet</Label>
                <Input
                  id="units"
                  type="number"
                  min={0}
                  value={formData.units_per_pallet}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      units_per_pallet: Math.max(
                        0,
                        parseInt(e.target.value) || 0,
                      ),
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                placeholder="Describe el producto, características y condiciones..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  setFormData({ ...formData, status: v as ProductStatus })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                htmlFor="featured"
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                  formData.featured
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, featured: checked === true })
                  }
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    Destacado
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Aparecerá en la sección principal del sitio.
                  </p>
                </div>
              </label>

              <label
                htmlFor="is_visible"
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                  formData.is_visible
                    ? "border-brand/40 bg-brand/5"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <Checkbox
                  id="is_visible"
                  checked={formData.is_visible}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_visible: checked === true })
                  }
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    Visible en el sitio
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Interno: si lo desmarcas, no aparece en el catálogo ni en
                    destacados.
                  </p>
                </div>
              </label>
            </div>

            <div className="space-y-1.5">
              <Label>
                Imagen principal{" "}
                {!editingProduct && <span className="text-red-500">*</span>}
              </Label>
              {mainImagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={mainImagePreview}
                    alt="Imagen principal"
                    className="h-40 w-40 rounded-lg object-cover border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeMainImage}
                    aria-label="Eliminar imagen principal"
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <label className="absolute bottom-2 left-2 bg-white/90 hover:bg-white text-gray-700 text-xs px-2 py-1 rounded-md shadow cursor-pointer">
                    Cambiar
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleMainImageChange}
                    />
                  </label>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-brand transition">
                  <div className="flex flex-col items-center text-gray-500">
                    <Upload className="h-7 w-7" />
                    <span className="mt-2 text-sm">
                      Subir imagen principal
                    </span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleMainImageChange}
                  />
                </label>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Imágenes adicionales</Label>
              <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-brand transition">
                <div className="flex items-center gap-2 text-gray-500">
                  <Upload className="h-5 w-5" />
                  <span className="text-sm">
                    Agregar más imágenes (opcional)
                  </span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesChange}
                />
              </label>
              {additionalPreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {additionalPreviews.map((preview, index) => (
                    <div key={preview} className="relative group">
                      <img
                        src={preview}
                        alt={`Imagen adicional ${index + 1}`}
                        className="h-24 w-full object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
                        aria-label={`Eliminar imagen ${index + 1}`}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="pt-2 border-t border-gray-100 -mx-6 px-6 sticky bottom-0 bg-white">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-brand hover:bg-brand-dark text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : editingProduct ? (
                  "Actualizar producto"
                ) : (
                  "Guardar producto"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto max-w-7xl">
        {/* Admin navigation */}
        <div className="mb-6">
          <AdminNav />
        </div>

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-3">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
              Panel de Administración
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona tu catálogo de productos
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={fetchProducts}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw
                className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>

            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                aria-label="Vista de cuadrícula"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                aria-label="Vista de lista"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button
              size="lg"
              className="bg-gradient-to-r from-brand to-brand-dark hover:opacity-90"
              onClick={openNewProduct}
            >
              <Plus className="mr-2 h-5 w-5" />
              Agregar Producto
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Productos</p>
                <p className="text-3xl font-bold text-brand">
                  {totalProducts}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-dark rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-2 border-purple-100 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Pallets</p>
                <p className="text-3xl font-bold text-purple-600">
                  {totalPallets}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-100 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Destacados</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {featuredProducts}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-2 border-green-100 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Categorías</p>
                <p className="text-3xl font-bold text-green-600">
                  {categories}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
                <Grid3x3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Products Grid or List View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-xl transition group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => openImageViewer(product, 0)}
                    aria-label={`Ver imágenes de ${product.title}`}
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    <ZoomIn className="h-8 w-8 text-white" />
                  </button>

                  <div
                    className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-bold ${
                      getStatusConfig(product.status).badgeClass
                    }`}
                  >
                    {getStatusConfig(product.status).label}
                  </div>
                  {product.is_visible === false && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold uppercase tracking-wide">
                      Oculto
                    </div>
                  )}

                  {product.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Destacado
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 text-gray-800 line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-sm text-brand font-semibold mb-2">
                    {product.category}
                  </p>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  {(product.quantity > 0 ||
                    product.units_per_pallet > 0) && (
                    <div className="flex gap-2 text-xs text-gray-500 mb-4">
                      {product.quantity > 0 && (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {product.quantity} pallets
                        </span>
                      )}
                      {product.units_per_pallet > 0 && (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {product.units_per_pallet} unidades
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">
                      Visible en el sitio
                    </span>
                    <Switch
                      checked={product.is_visible ?? true}
                      onCheckedChange={() => toggleVisibility(product)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(product)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTarget(product)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Imagen</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-center">Pallets</TableHead>
                  <TableHead className="text-center">Unidades</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Visible</TableHead>
                  <TableHead className="text-center">Destacado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => openImageViewer(product, 0)}
                        aria-label={`Ver imágenes de ${product.title}`}
                        className="relative group block"
                      >
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100 rounded">
                          <ZoomIn className="h-5 w-5 text-white" />
                        </div>
                      </button>
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {product.quantity > 0 ? product.quantity : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.units_per_pallet > 0
                        ? product.units_per_pallet
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getStatusConfig(product.status).badgeClass}>
                        {getStatusConfig(product.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={product.is_visible ?? true}
                        onCheckedChange={() => toggleVisibility(product)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {product.featured ? (
                        <Badge className="bg-yellow-500">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Destacado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Normal</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {products.length === 0 && !refreshing && (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No hay productos
            </h3>
            <p className="text-gray-500">
              Comienza agregando tu primer producto
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
