import { isSupabaseConfigured } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/client";

export type ContentChannel = "instagram" | "facebook" | "ambos";
export type ContentFormat = "reel" | "carrusel" | "estatico" | "historia";
export type ContentStatus = "nuevo" | "produccion" | "publicado" | "pautado";

export interface ContentItem {
  id: string;
  scheduled_date: string; // 'YYYY-MM-DD'
  channel: ContentChannel;
  format: ContentFormat;
  title: string;
  copy: string;
  status: ContentStatus;
  notes: string;
  product_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type NewContentItem = Omit<
  ContentItem,
  "id" | "created_at" | "updated_at"
>;

export interface ContentFetchResult {
  items: ContentItem[];
  /** true cuando se muestran datos de ejemplo (no persistidos) */
  isExample: boolean;
}

// ---------------------------------------------------------------------------
// Metadata para etiquetas y colores (se reutiliza en la UI)
// ---------------------------------------------------------------------------

export const CHANNELS: Record<
  ContentChannel,
  { label: string; dot: string; badge: string }
> = {
  instagram: {
    label: "Instagram",
    dot: "bg-pink-500",
    badge: "bg-pink-100 text-pink-700 border-pink-200",
  },
  facebook: {
    label: "Facebook",
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
  },
  ambos: {
    label: "Ambos",
    dot: "bg-purple-500",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

export const FORMATS: Record<ContentFormat, { label: string }> = {
  reel: { label: "Reel" },
  carrusel: { label: "Carrusel" },
  estatico: { label: "Estático" },
  historia: { label: "Historia" },
};

export const STATUSES: Record<
  ContentStatus,
  { label: string; badge: string; dot: string }
> = {
  nuevo: {
    label: "Nuevo",
    badge: "bg-gray-100 text-gray-700 border-gray-200",
    dot: "bg-gray-400",
  },
  produccion: {
    label: "En producción",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  publicado: {
    label: "Publicado",
    badge: "bg-green-100 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  pautado: {
    label: "Pautado",
    badge: "bg-violet-100 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
  },
};

// ---------------------------------------------------------------------------
// Datos de ejemplo (fase diseño): se generan para el mes en curso
// ---------------------------------------------------------------------------

function ymd(year: number, monthIndex: number, day: number): string {
  const mm = String(monthIndex + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/** Genera ~8 piezas de ejemplo repartidas en el mes actual. */
export function exampleContent(reference: Date = new Date()): ContentItem[] {
  const y = reference.getFullYear();
  const m = reference.getMonth();

  const seed: Array<
    [number, ContentChannel, ContentFormat, ContentStatus, string]
  > = [
    [2, "instagram", "reel", "publicado", "Recorrido por el almacén 🏭"],
    [4, "facebook", "carrusel", "publicado", "Testimonio de cliente revendedor"],
    [7, "ambos", "reel", "pautado", "Unboxing pallet Amazon devoluciones"],
    [10, "instagram", "historia", "produccion", "Encuesta: ¿qué pallet quieres ver?"],
    [14, "instagram", "reel", "produccion", "Antes/después: revendedor con ganancias"],
    [17, "facebook", "carrusel", "nuevo", "Guía: cómo empezar a revender pallets"],
    [21, "ambos", "reel", "nuevo", "Llegada de nuevo lote — teaser"],
    [25, "instagram", "carrusel", "nuevo", "Carrusel: 5 categorías más rentables"],
  ];

  return seed.map(([day, channel, format, status, title], i) => ({
    id: `example-${i}`,
    scheduled_date: ymd(y, m, day),
    channel,
    format,
    title,
    copy: "",
    status,
    notes: "",
    product_id: null,
  }));
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function getContent(): Promise<ContentFetchResult> {
  if (!isSupabaseConfigured()) {
    return { items: exampleContent(), isExample: true };
  }

  try {
    const { data, error } = await createClient()
      .from("content_plan")
      .select("*")
      .order("scheduled_date", { ascending: true });

    if (error) {
      // Tabla aún no creada u otro problema de lectura: mostrar ejemplos.
      console.warn("content_plan no disponible, usando datos de ejemplo:", error.message);
      return { items: exampleContent(), isExample: true };
    }

    return { items: (data as ContentItem[]) || [], isExample: false };
  } catch (error) {
    console.warn("Error leyendo content_plan, usando datos de ejemplo:", error);
    return { items: exampleContent(), isExample: true };
  }
}

export async function addContent(
  item: NewContentItem,
): Promise<ContentItem | null> {
  if (!isSupabaseConfigured()) return null;

  // Cast puntual: @supabase/ssr@0.5.2 (instalado) infiere el genérico Database
  // de forma incompatible con @supabase/supabase-js@2.76 (mismatch de versiones
  // preexistente, no introducido por este cambio), lo que resuelve el tipo de
  // fila a `never`. No afecta el comportamiento en runtime.
  const { data, error } = await createClient()
    .from("content_plan")
    .insert([item] as never)
    .select()
    .single();

  if (error) {
    console.error("Error agregando contenido:", error);
    return null;
  }

  return data as ContentItem;
}

export async function updateContent(
  id: string,
  item: Partial<NewContentItem>,
): Promise<ContentItem | null> {
  if (!isSupabaseConfigured()) return null;

  // Ver nota de cast en addContent (mismatch de tipos @supabase/ssr vs supabase-js).
  const { data, error } = await createClient()
    .from("content_plan")
    .update({ ...item, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error actualizando contenido:", error);
    return null;
  }

  return data as ContentItem;
}

export async function deleteContent(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { error } = await createClient().from("content_plan").delete().eq("id", id);

  if (error) {
    console.error("Error eliminando contenido:", error);
    return false;
  }

  return true;
}
