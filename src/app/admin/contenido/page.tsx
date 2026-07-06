"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getContent,
  addContent,
  updateContent,
  deleteContent,
  exampleContent,
  ContentItem,
  ContentChannel,
  ContentFormat,
  ContentStatus,
  CHANNELS,
  FORMATS,
  STATUSES,
} from "@/lib/content";
import { getProducts, Product } from "@/lib/products";
import { AdminNav } from "@/components/admin/AdminNav";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  List,
  Trash2,
  Edit,
  Loader2,
  RefreshCw,
  Info,
  Megaphone,
  Check,
  CheckCircle2,
  Circle,
} from "lucide-react";

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const CHANNEL_KEYS = Object.keys(CHANNELS) as ContentChannel[];
const FORMAT_KEYS = Object.keys(FORMATS) as ContentFormat[];
const STATUS_KEYS = Object.keys(STATUSES) as ContentStatus[];

interface ContentFormData {
  scheduled_date: string;
  channel: ContentChannel;
  format: ContentFormat;
  title: string;
  copy: string;
  status: ContentStatus;
  done: boolean;
  notes: string;
  product_id: string | null;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function ymd(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDayLong(s: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseYmd(s));
}

function localId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `local-${crypto.randomUUID()}`;
  }
  return `local-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

export default function AdminContenidoPage() {
  const { toast } = useToast();

  const [items, setItems] = useState<ContentItem[]>([]);
  const [isExample, setIsExample] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [viewMode, setViewMode] = useState<"month" | "list">("month");
  const [channelFilter, setChannelFilter] = useState<"all" | ContentChannel>(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<"all" | ContentStatus>(
    "all",
  );

  const now = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const [dayModalDate, setDayModalDate] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState<ContentFormData>(() => ({
    scheduled_date: ymd(now.getFullYear(), now.getMonth(), now.getDate()),
    channel: "instagram",
    format: "reel",
    title: "",
    copy: "",
    status: "nuevo",
    done: false,
    notes: "",
    product_id: null,
  }));

  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchContent = useCallback(async () => {
    setRefreshing(true);
    const { items: data, isExample: ex } = await getContent();
    setItems(data);
    setIsExample(ex);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchContent();
    getProducts().then(setProducts);
  }, [fetchContent]);

  // -------------------------------------------------------------------------
  // Derived data
  // -------------------------------------------------------------------------

  const monthPrefix = `${viewYear}-${pad(viewMonth + 1)}`;

  const passesFilters = useCallback(
    (item: ContentItem) =>
      (channelFilter === "all" || item.channel === channelFilter) &&
      (statusFilter === "all" || item.status === statusFilter),
    [channelFilter, statusFilter],
  );

  const monthItems = useMemo(
    () =>
      items.filter(
        (i) => i.scheduled_date.startsWith(monthPrefix) && passesFilters(i),
      ),
    [items, monthPrefix, passesFilters],
  );

  const itemsByDay = useMemo(() => {
    const map: Record<string, ContentItem[]> = {};
    for (const item of monthItems) {
      (map[item.scheduled_date] ||= []).push(item);
    }
    return map;
  }, [monthItems]);

  // Todo el contenido de un día (sin filtros) para el modal de día.
  const dayModalItems = useMemo(
    () =>
      dayModalDate
        ? items
            .filter((i) => i.scheduled_date === dayModalDate)
            .sort((a, b) => a.status.localeCompare(b.status))
        : [],
    [items, dayModalDate],
  );

  const stats = useMemo(() => {
    const inMonth = items.filter((i) => i.scheduled_date.startsWith(monthPrefix));
    return {
      total: inMonth.length,
      produccion: inMonth.filter((i) => i.status === "produccion").length,
      publicado: inMonth.filter((i) => i.status === "publicado").length,
      pautado: inMonth.filter((i) => i.status === "pautado").length,
      hechos: inMonth.filter((i) => i.done).length,
    };
  }, [items, monthPrefix]);

  const calendarCells = useMemo(() => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<{ day: number; date: string } | null> = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, date: ymd(viewYear, viewMonth, d) });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("es-MX", {
        month: "long",
        year: "numeric",
      }).format(new Date(viewYear, viewMonth, 1)),
    [viewYear, viewMonth],
  );

  const todayStr = ymd(now.getFullYear(), now.getMonth(), now.getDate());

  const productTitleById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of products) map[p.id] = p.title;
    return map;
  }, [products]);

  // -------------------------------------------------------------------------
  // Month navigation
  // -------------------------------------------------------------------------

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  // -------------------------------------------------------------------------
  // Form open/close
  // -------------------------------------------------------------------------

  const openDay = (dateStr: string) => {
    setDayModalDate(dateStr);
  };

  const openNew = (dateStr?: string) => {
    setDayModalDate(null);
    setEditingItem(null);
    setFormData({
      scheduled_date: dateStr || ymd(viewYear, viewMonth, 1),
      channel: "instagram",
      format: "reel",
      title: "",
      copy: "",
      status: "nuevo",
      done: false,
      notes: "",
      product_id: null,
    });
    setDialogOpen(true);
  };

  const openEdit = (item: ContentItem) => {
    setDayModalDate(null);
    setEditingItem(item);
    setFormData({
      scheduled_date: item.scheduled_date,
      channel: item.channel,
      format: item.format,
      title: item.title,
      copy: item.copy,
      status: item.status,
      done: item.done ?? false,
      notes: item.notes,
      product_id: item.product_id ?? null,
    });
    setDialogOpen(true);
  };

  // -------------------------------------------------------------------------
  // Save / delete
  // -------------------------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: "Falta el título",
        description: "Dale un nombre corto a la idea de contenido.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.scheduled_date) {
      toast({
        title: "Falta la fecha",
        description: "Elige el día en que se publicará.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...formData,
      title: formData.title.trim(),
      copy: formData.copy.trim(),
      notes: formData.notes.trim(),
    };

    // Modo ejemplo: solo mutar estado local (no persiste).
    if (isExample) {
      if (editingItem) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === editingItem.id ? { ...i, ...payload } : i,
          ),
        );
      } else {
        setItems((prev) => [...prev, { id: localId(), ...payload }]);
      }
      toast({
        title: "Modo ejemplo",
        description:
          "Guardado solo en pantalla. Conecta la base de datos para que persista.",
      });
      setDialogOpen(false);
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await updateContent(editingItem.id, payload);
        toast({ title: "Contenido actualizado" });
      } else {
        await addContent(payload);
        toast({ title: "Contenido agregado" });
      }
      setDialogOpen(false);
      fetchContent();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "No se pudo guardar.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (isExample) {
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast({ title: "Eliminado (modo ejemplo)" });
      return;
    }

    setDeleting(true);
    const ok = await deleteContent(deleteTarget.id);
    setDeleting(false);

    if (ok) {
      toast({ title: "Contenido eliminado" });
      setDeleteTarget(null);
      fetchContent();
    } else {
      toast({
        title: "Error",
        description: "No se pudo eliminar.",
        variant: "destructive",
      });
    }
  };

  // Marca rápida "ya se hizo" (optimista, con reversión si falla).
  const toggleDone = async (item: ContentItem) => {
    const next = !item.done;

    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, done: next } : i)),
    );

    if (isExample) return;

    const res = await updateContent(item.id, { done: next });
    if (!res) {
      // Revertir en caso de error.
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, done: !next } : i)),
      );
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado.",
        variant: "destructive",
      });
    }
  };

  const resetExamples = () => {
    setItems(exampleContent(new Date(viewYear, viewMonth, 15)));
    toast({ title: "Ejemplos restaurados" });
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4 pt-32">
      <Toaster />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar contenido</AlertDialogTitle>
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

      {/* Day detail modal */}
      <Dialog
        open={!!dayModalDate}
        onOpenChange={(open) => !open && setDayModalDate(null)}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-brand capitalize">
              {dayModalDate ? formatDayLong(dayModalDate) : ""}
            </DialogTitle>
            <DialogDescription>
              {dayModalItems.length === 0
                ? "No hay contenido planeado para este día."
                : `${dayModalItems.length} ${
                    dayModalItems.length === 1
                      ? "publicación planeada"
                      : "publicaciones planeadas"
                  } este día.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-1">
            {dayModalItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aún no hay nada aquí.</p>
              </div>
            ) : (
              dayModalItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-2 rounded-lg border p-3 transition ${
                    item.done
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "hover:border-brand hover:bg-brand/5"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleDone(item)}
                    aria-pressed={item.done}
                    title={
                      item.done ? "Marcar como no hecho" : "Marcar como hecho"
                    }
                    className="mt-0.5 shrink-0"
                  >
                    {item.done ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-300 hover:text-brand transition" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`font-medium ${
                          item.done
                            ? "text-gray-500 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {item.title}
                      </span>
                      <Edit className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {item.done && (
                        <Badge
                          variant="outline"
                          className="bg-emerald-100 text-emerald-700 border-emerald-200"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Hecho
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={CHANNELS[item.channel].badge}
                      >
                        {CHANNELS[item.channel].label}
                      </Badge>
                      <Badge variant="outline">
                        {FORMATS[item.format].label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={STATUSES[item.status].badge}
                      >
                        {STATUSES[item.status].label}
                      </Badge>
                    </div>
                    {item.copy && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {item.copy}
                      </p>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => dayModalDate && openNew(dayModalDate)}
              className="bg-brand hover:bg-brand-dark text-white w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar publicación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-brand">
              {editingItem ? "Editar contenido" : "Nueva publicación"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Actualiza los detalles de esta pieza de contenido."
                : "Planea una nueva pieza de contenido para el calendario."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">
                Título / idea <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ej: Unboxing pallet Amazon devoluciones"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="scheduled_date">
                  Fecha <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduled_date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) =>
                    setFormData({ ...formData, status: v as ContentStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_KEYS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {STATUSES[k].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Canal</Label>
                <Select
                  value={formData.channel}
                  onValueChange={(v) =>
                    setFormData({ ...formData, channel: v as ContentChannel })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNEL_KEYS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {CHANNELS[k].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Formato</Label>
                <Select
                  value={formData.format}
                  onValueChange={(v) =>
                    setFormData({ ...formData, format: v as ContentFormat })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAT_KEYS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {FORMATS[k].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="copy">Texto / caption</Label>
              <Textarea
                id="copy"
                value={formData.copy}
                onChange={(e) =>
                  setFormData({ ...formData, copy: e.target.value })
                }
                rows={4}
                placeholder="El texto del post (se llena en la fase de contenido real)..."
              />
            </div>

            <label
              htmlFor="done"
              className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition ${
                formData.done
                  ? "border-emerald-300 bg-emerald-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <Checkbox
                id="done"
                checked={formData.done}
                onCheckedChange={(c) =>
                  setFormData({ ...formData, done: c === true })
                }
              />
              <div>
                <span className="font-medium text-gray-900">
                  Ya se hizo / ya se publicó
                </span>
                <p className="text-sm text-gray-500">
                  Márcalo cuando la pieza ya esté lista y subida.
                </p>
              </div>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Producto destacado (opcional)</Label>
                <Select
                  value={formData.product_id ?? "none"}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      product_id: v === "none" ? null : v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ninguno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Notas</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Guion, referencia, hashtags..."
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              {editingItem && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setDeleteTarget(editingItem);
                  }}
                  className="mr-auto text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-brand hover:bg-brand-dark text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : editingItem ? (
                  "Actualizar"
                ) : (
                  "Guardar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <AdminNav />
        </div>

        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
              Calendario de Contenido
            </h1>
            <p className="text-gray-600 mt-2">
              Planea y da seguimiento a lo que se publica en redes
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={fetchContent}
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
                variant={viewMode === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("month")}
                aria-label="Vista de calendario"
              >
                <CalendarDays className="h-4 w-4" />
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
              onClick={() => openNew()}
            >
              <Plus className="mr-2 h-5 w-5" />
              Nueva publicación
            </Button>
          </div>
        </div>

        {/* Example-data banner */}
        {isExample && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            <Info className="h-5 w-5 shrink-0" />
            <p className="text-sm flex-1">
              <span className="font-semibold">Datos de ejemplo.</span> Estás
              viendo el diseño con contenido de muestra; los cambios no se
              guardan. Cuando apruebes el diseño, creamos la tabla y cargamos el
              plan real.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={resetExamples}
              className="border-amber-300 text-amber-800 hover:bg-amber-100"
            >
              Restaurar ejemplos
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard
            label="Total del mes"
            value={stats.total}
            className="from-blue-50 border-blue-100 text-brand"
            icon={<CalendarDays className="w-5 h-5 text-white" />}
            iconBg="from-brand to-brand-dark"
          />
          <StatCard
            label="Hechos del mes"
            value={stats.hechos}
            className="from-emerald-50 border-emerald-100 text-emerald-600"
            icon={<CheckCircle2 className="w-5 h-5 text-white" />}
            iconBg="from-emerald-500 to-emerald-700"
          />
          <StatCard
            label="En producción"
            value={stats.produccion}
            className="from-amber-50 border-amber-100 text-amber-600"
            icon={<Loader2 className="w-5 h-5 text-white" />}
            iconBg="from-amber-500 to-amber-700"
          />
          <StatCard
            label="Publicados"
            value={stats.publicado}
            className="from-green-50 border-green-100 text-green-600"
            icon={<CalendarDays className="w-5 h-5 text-white" />}
            iconBg="from-green-500 to-green-700"
          />
          <StatCard
            label="Pautados"
            value={stats.pautado}
            className="from-violet-50 border-violet-100 text-violet-600"
            icon={<Megaphone className="w-5 h-5 text-white" />}
            iconBg="from-violet-500 to-violet-700"
          />
        </div>

        {/* Controls: month nav + filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold capitalize min-w-[11rem] text-center">
              {monthLabel}
            </span>
            <Button variant="outline" size="icon" onClick={goNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToday}>
              Hoy
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={channelFilter}
              onValueChange={(v) =>
                setChannelFilter(v as "all" | ContentChannel)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los canales</SelectItem>
                {CHANNEL_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {CHANNELS[k].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as "all" | ContentStatus)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {STATUS_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {STATUSES[k].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Month view */}
        {viewMode === "month" ? (
          <Card className="overflow-hidden">
            <div className="grid grid-cols-7 border-b bg-gray-50">
              {WEEKDAYS.map((w) => (
                <div
                  key={w}
                  className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarCells.map((cell, idx) => {
                if (!cell) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[7rem] border-b border-r bg-gray-50/50"
                    />
                  );
                }
                const dayItems = itemsByDay[cell.date] || [];
                const isToday = cell.date === todayStr;
                return (
                  <button
                    type="button"
                    key={cell.date}
                    onClick={() => openDay(cell.date)}
                    className="min-h-[7rem] border-b border-r p-1.5 text-left align-top hover:bg-brand/5 transition group relative"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                          isToday
                            ? "bg-brand text-white"
                            : "text-gray-500"
                        }`}
                      >
                        {cell.day}
                      </span>
                      <Plus className="h-3.5 w-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <div className="space-y-1">
                      {dayItems.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-1 rounded px-1.5 py-1 text-[11px] leading-tight border ${CHANNELS[item.channel].badge} ${item.done ? "opacity-60" : ""}`}
                          title={`${CHANNELS[item.channel].label} · ${FORMATS[item.format].label} · ${STATUSES[item.status].label}${item.done ? " · Hecho" : ""}`}
                        >
                          {item.done ? (
                            <Check className="h-3 w-3 shrink-0 text-emerald-600" />
                          ) : (
                            <span
                              className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUSES[item.status].dot}`}
                            />
                          )}
                          <span
                            className={`truncate ${item.done ? "line-through" : ""}`}
                          >
                            {item.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">Hecho</TableHead>
                  <TableHead className="w-28">Fecha</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthItems
                  .slice()
                  .sort((a, b) =>
                    a.scheduled_date.localeCompare(b.scheduled_date),
                  )
                  .map((item) => (
                    <TableRow
                      key={item.id}
                      className={item.done ? "bg-emerald-50/40" : ""}
                    >
                      <TableCell className="text-center">
                        <button
                          type="button"
                          onClick={() => toggleDone(item)}
                          aria-pressed={item.done}
                          title={
                            item.done
                              ? "Marcar como no hecho"
                              : "Marcar como hecho"
                          }
                          className="inline-flex"
                        >
                          {item.done ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300 hover:text-brand transition" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.scheduled_date}
                      </TableCell>
                      <TableCell
                        className={`font-medium ${
                          item.done ? "text-gray-500 line-through" : ""
                        }`}
                      >
                        {item.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={CHANNELS[item.channel].badge}
                        >
                          {CHANNELS[item.channel].label}
                        </Badge>
                      </TableCell>
                      <TableCell>{FORMATS[item.format].label}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={STATUSES[item.status].badge}
                        >
                          {STATUSES[item.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {item.product_id
                          ? productTitleById[item.product_id] || "—"
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            {monthItems.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No hay contenido este mes con los filtros actuales.
              </div>
            )}
          </Card>
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
          <span className="font-medium text-gray-700">Canales:</span>
          {CHANNEL_KEYS.map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className={`h-3 w-3 rounded-full ${CHANNELS[k].dot}`} />
              {CHANNELS[k].label}
            </span>
          ))}
          <span className="font-medium text-gray-700 ml-2">Estados:</span>
          {STATUS_KEYS.map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className={`h-3 w-3 rounded-full ${STATUSES[k].dot}`} />
              {STATUSES[k].label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  className,
  icon,
  iconBg,
}: {
  label: string;
  value: number;
  className: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <Card
      className={`p-5 bg-gradient-to-br to-white border-2 hover:shadow-lg transition ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div
          className={`w-11 h-11 bg-gradient-to-br ${iconBg} rounded-full flex items-center justify-center shrink-0`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
