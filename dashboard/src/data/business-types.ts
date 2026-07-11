export interface BusinessType {
  id: string;
  label: string;
  icon: string;
  /** Feature ids we pre-suggest for this business type. */
  suggestedFeatures: string[];
}

export const BUSINESS_TYPES: BusinessType[] = [
  { id: "restaurant", label: "Restoran", icon: "UtensilsCrossed", suggestedFeatures: ["digital-menu", "qr-menu", "reservation-system", "gallery"] },
  { id: "cafe", label: "Kafe", icon: "Coffee", suggestedFeatures: ["digital-menu", "qr-menu", "gallery", "animations"] },
  { id: "barber", label: "Berber / Kuaför", icon: "Scissors", suggestedFeatures: ["reservation-system", "gallery", "team"] },
  { id: "clinic", label: "Klinik", icon: "Stethoscope", suggestedFeatures: ["reservation-system", "team", "seo-schema"] },
  { id: "hotel", label: "Otel", icon: "BedDouble", suggestedFeatures: ["reservation-system", "gallery", "perf-i18n", "career"] },
  { id: "lawyer", label: "Avukat", icon: "Scale", suggestedFeatures: ["team", "blog", "contact"] },
  { id: "dentist", label: "Diş Hekimi", icon: "Smile", suggestedFeatures: ["reservation-system", "team", "faq"] },
  { id: "gym", label: "Spor Salonu", icon: "Dumbbell", suggestedFeatures: ["pricing", "gallery", "reservation-system"] },
  { id: "realestate", label: "Emlak", icon: "Building2", suggestedFeatures: ["gallery", "contact", "seo-schema"] },
  { id: "other", label: "Diğer", icon: "Sparkles", suggestedFeatures: [] },
];

export const BUSINESS_TYPE_MAP: Record<string, BusinessType> = Object.fromEntries(
  BUSINESS_TYPES.map((b) => [b.id, b]),
);
