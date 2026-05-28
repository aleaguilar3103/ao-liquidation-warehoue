// Configuración central del flujo de agendamiento (valoración)
// Toda la lógica de horarios trabaja en hora Costa Rica (UTC-6, sin horario de verano).

export const CR_UTC_OFFSET_HOURS = -6;

export const BOOKING_CALENDAR_ID = "QDriITFTkNaNplDQd7N2";

// Ventana laboral (hora CR)
export const WORK_START_HOUR = 8;   // 8:00 AM CR
export const WORK_END_HOUR = 17;    // 5:00 PM CR (las citas deben terminar a esta hora o antes)

// Duración real de la llamada (la valoración dura 10–15 min, reservamos 15)
export const SLOT_DURATION_MIN = 15;

// Espacio mínimo entre llamadas
export const BUFFER_MIN = 30;

// Ciclo total entre arranques de slot
export const SLOT_STEP_MIN = SLOT_DURATION_MIN + BUFFER_MIN; // 45 min

// Cuántos días hacia adelante mostrar disponibilidad
export const DAYS_AHEAD = 30;

// Tiempo mínimo desde "ahora" para poder reservar (anticipación)
export const MIN_LEAD_TIME_MIN = 60;

// =========================================================================
// Custom Fields de GHL
// -------------------------------------------------------------------------
// OJO: la API /contacts/upsert guarda custom fields por "id" del campo,
// NO por el fieldKey (ej "contact.nombre_del_negocio" se ignora en silencio).
// Estos ids salen de GET /locations/{id}/customFields. Dejá "" lo que no uses.
// =========================================================================
export const GHL_CUSTOM_FIELD_IDS = {
  business: "MrzXmiIthCRjGtkOcayU", // Nombre del Negocio (TEXT)
  businessType: "qky7kbaOFTOcoacsN4gQ", // Tipo de Negocio (SINGLE_OPTIONS)
  categories: "ViN1e0sZtZ4Hz6tkIuxh", // Categorías de Interés (MULTIPLE_OPTIONS)
  message: "5AVet73SKr1zWqwfyCLV", // Mensaje del Cliente (LARGE_TEXT)
};
