export type ProductStatus =
  | "disponible"
  | "pocas_unidades"
  | "proximamente"
  | "en_camino"
  | "agotado"
  | "no_disponible";

export interface ProductStatusConfig {
  value: ProductStatus;
  label: string;
  /** Clases Tailwind del badge (fondo + texto). */
  badgeClass: string;
  /** ¿El botón de WhatsApp queda activo en este estado? */
  contactEnabled: boolean;
}

export const PRODUCT_STATUSES: ProductStatusConfig[] = [
  { value: "disponible",     label: "Disponible",            badgeClass: "bg-green-500 text-white", contactEnabled: true },
  { value: "pocas_unidades", label: "Quedan pocas unidades", badgeClass: "bg-amber-500 text-white", contactEnabled: true },
  { value: "proximamente",   label: "Próximamente",          badgeClass: "bg-blue-500 text-white",  contactEnabled: true },
  { value: "en_camino",      label: "En camino",             badgeClass: "bg-teal-500 text-white",  contactEnabled: true },
  { value: "agotado",        label: "Agotado",               badgeClass: "bg-red-500 text-white",   contactEnabled: false },
  { value: "no_disponible",  label: "No disponible",         badgeClass: "bg-gray-500 text-white",  contactEnabled: false },
];

export const DEFAULT_STATUS: ProductStatus = "disponible";

const STATUS_MAP: Record<string, ProductStatusConfig> = Object.fromEntries(
  PRODUCT_STATUSES.map((s) => [s.value, s]),
);

/** Lookup seguro: si el valor no existe o es nulo, cae a `disponible`. */
export function getStatusConfig(
  status: string | null | undefined,
): ProductStatusConfig {
  return (status && STATUS_MAP[status]) || STATUS_MAP[DEFAULT_STATUS];
}
