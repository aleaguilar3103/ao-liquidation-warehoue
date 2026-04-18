"use client";

import { useState, useEffect } from "react";
import { getProducts, addProduct, updateProduct, deleteProduct, Product } from "@/lib/products";
import { uploadProductImage } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Upload, X, Package, Layers, Star, Grid3x3, RefreshCw, Grid, List, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function AdminProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentProductImages, setCurrentProductImages] = useState<string[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    quantity: 0,
    units_per_pallet: 0,
    featured: false,
    available: true,
  });

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

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAdditionalImages([...additionalImages, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setAdditionalPreviews([...additionalPreviews, ...previews]);
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
    setAdditionalPreviews(additionalPreviews.filter((_, i) => i !== index));
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
      available: product.available ?? true,
    });
    setMainImagePreview(product.image_url);
    setAdditionalPreviews(product.additional_images || []);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      title: "",
      category: "",
      description: "",
      quantity: 0,
      units_per_pallet: 0,
      featured: false,
      available: true,
    });
    setMainImage(null);
    setAdditionalImages([]);
    setMainImagePreview("");
    setAdditionalPreviews([]);
    setDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let mainImageUrl = editingProduct?.image_url || "";
      
      if (mainImage) {
        const url = await uploadProductImage(mainImage);
        if (url) mainImageUrl = url;
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
        image_url: mainImageUrl,
        additional_images: additionalImageUrls,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast({
          title: "Producto actualizado",
          description: "El producto se actualizó correctamente",
        });
      } else {
        await addProduct(productData);
        toast({
          title: "Producto creado",
          description: "El producto se creó correctamente",
        });
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al guardar el producto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    
    const success = await deleteProduct(id);
    if (success) {
      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó correctamente",
      });
      fetchProducts();
    } else {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (product: Product) => {
    const updatedProduct = {
      ...product,
      available: !product.available,
    };
    
    const success = await updateProduct(product.id, updatedProduct);
    if (success) {
      toast({
        title: "Disponibilidad actualizada",
        description: `Producto marcado como ${!product.available ? 'disponible' : 'no disponible'}`,
      });
      fetchProducts();
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar la disponibilidad",
        variant: "destructive",
      });
    }
  };

  const openImageViewer = (product: Product, startIndex: number = 0) => {
    const allImages = [product.image_url, ...(product.additional_images || [])];
    setCurrentProductImages(allImages);
    setCurrentImageIndex(startIndex);
    setImageViewerOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % currentProductImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + currentProductImages.length) % currentProductImages.length);
  };

  const totalProducts = products.length;
  const totalPallets = products.reduce((sum, p) => sum + p.quantity, 0);
  const featuredProducts = products.filter(p => p.featured).length;
  const categories = new Set(products.map(p => p.category)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4 pt-32">
      <Toaster />
      
      {/* Image Viewer Modal */}
      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="max-w-5xl h-[90vh] bg-black/95">
          <div className="relative h-full flex items-center justify-center">
            <img
              src={currentProductImages[currentImageIndex]}
              alt="Product"
              className="max-h-full max-w-full object-contain"
            />
            
            {currentProductImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 px-4 py-2 rounded-full text-white">
                  {currentImageIndex + 1} / {currentProductImages.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
              Panel de Administración
            </h1>
            <p className="text-gray-600 mt-2">Gestiona tu catálogo de productos</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline"
              size="lg"
              onClick={fetchProducts}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>

            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-brand to-brand-dark hover:opacity-90"
                  onClick={() => resetForm()}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Agregar Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="Ej: Pallet de Electrónicos"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Categoría *</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        placeholder="Ej: Electrónicos"
                      />
                    </div>

                    <div>
                      <Label htmlFor="quantity">Cantidad de Pallets</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="units">Unidades por Pallet</Label>
                      <Input
                        id="units"
                        type="number"
                        value={formData.units_per_pallet}
                        onChange={(e) => setFormData({ ...formData, units_per_pallet: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                    <h3 className="font-semibold text-gray-900 text-lg mb-4">Opciones del Producto</h3>
                    
                    <div className="flex items-center space-x-3 p-4 bg-white border-2 border-gray-300 rounded-lg hover:border-brand transition cursor-pointer">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="h-6 w-6 rounded border-gray-400 text-brand focus:ring-brand cursor-pointer"
                      />
                      <Label htmlFor="featured" className="cursor-pointer font-medium text-gray-900 text-base flex-1">
                        ⭐ Marcar como Producto Destacado
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-white border-2 border-gray-300 rounded-lg hover:border-green-500 transition cursor-pointer">
                      <input
                        type="checkbox"
                        id="available"
                        checked={formData.available}
                        onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                        className="h-6 w-6 rounded border-gray-400 text-green-600 focus:ring-green-500 cursor-pointer"
                      />
                      <Label htmlFor="available" className="cursor-pointer font-medium text-gray-900 text-base flex-1">
                        ✅ Producto Disponible para la Venta
                      </Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      placeholder="Describe el producto..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="mainImage">Imagen Principal {!editingProduct && "*"}</Label>
                    <div className="mt-2">
                      <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <div className="flex flex-col items-center">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="mt-2 text-sm text-gray-500">
                            {editingProduct ? "Cambiar imagen principal" : "Subir imagen principal"}
                          </span>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleMainImageChange}
                          required={!editingProduct}
                        />
                      </label>
                      {mainImagePreview && (
                        <div className="mt-4">
                          <img src={mainImagePreview} alt="Preview" className="h-40 rounded-lg object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Imágenes Adicionales</Label>
                    <div className="mt-2">
                      <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <div className="flex flex-col items-center">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="mt-2 text-sm text-gray-500">Subir imágenes adicionales</span>
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
                        <div className="mt-4 grid grid-cols-4 gap-4">
                          {additionalPreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img src={preview} alt={`Preview ${index}`} className="h-24 w-full object-cover rounded-lg" />
                              <button
                                type="button"
                                onClick={() => removeAdditionalImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Guardando..." : editingProduct ? "Actualizar Producto" : "Guardar Producto"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Productos</p>
                <p className="text-3xl font-bold text-brand">{totalProducts}</p>
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
                <p className="text-3xl font-bold text-purple-600">{totalPallets}</p>
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
                <p className="text-3xl font-bold text-yellow-600">{featuredProducts}</p>
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
                <p className="text-3xl font-bold text-green-600">{categories}</p>
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
              <Card key={product.id} className="overflow-hidden hover:shadow-xl transition group">
                <div className="relative h-48 overflow-hidden group">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <button
                    onClick={() => openImageViewer(product, 0)}
                    className="absolute inset-0 bg-black/0 hover:bg-black/40 transition flex items-center justify-center opacity-0 hover:opacity-100"
                  >
                    <ZoomIn className="h-8 w-8 text-white" />
                  </button>
                  
                  {/* Availability Badge */}
                  <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-bold text-white ${
                    product.available ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {product.available ? 'DISPONIBLE' : 'NO DISPONIBLE'}
                  </div>
                  
                  {product.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Destacado
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 text-gray-800">{product.title}</h3>
                  <p className="text-sm text-brand font-semibold mb-2">{product.category}</p>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  {(product.quantity > 0 || product.units_per_pallet > 0) && (
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
                  
                  {/* Availability Switch */}
                  <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Disponible</span>
                    <Switch
                      checked={product.available}
                      onCheckedChange={() => toggleAvailability(product)}
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
                      onClick={() => handleDelete(product.id)}
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
                  <TableHead className="text-center">Disponibilidad</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative group cursor-pointer" onClick={() => openImageViewer(product, 0)}>
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100 rounded">
                          <ZoomIn className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {product.quantity > 0 ? product.quantity : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.units_per_pallet > 0 ? product.units_per_pallet : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={product.available}
                          onCheckedChange={() => toggleAvailability(product)}
                        />
                        <Badge className={product.available ? "bg-green-500" : "bg-red-500"}>
                          {product.available ? "Disponible" : "No disponible"}
                        </Badge>
                      </div>
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
                          onClick={() => handleDelete(product.id)}
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

        {products.length === 0 && (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay productos</h3>
            <p className="text-gray-500">Comienza agregando tu primer producto</p>
          </div>
        )}
      </div>
    </div>
  );
}