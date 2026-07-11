export type ProjectStatus = "draft" | "analyzing" | "ready" | "generating" | "completed";

export interface ProjectRecord {
  id: string;
  name: string;
  businessType: string;
  status: ProjectStatus;
  featureCount: number;
  priceEur: number;
  updatedAt: string;
  progress: number;
  accent: string;
}

export const STATUS_META: Record<
  ProjectStatus,
  { label: string; variant: "default" | "primary" | "success" | "warning" }
> = {
  draft: { label: "Taslak", variant: "default" },
  analyzing: { label: "Analiz ediliyor", variant: "warning" },
  ready: { label: "Üretime hazır", variant: "primary" },
  generating: { label: "Üretiliyor", variant: "warning" },
  completed: { label: "Tamamlandı", variant: "success" },
};

export const MOCK_PROJECTS: ProjectRecord[] = [
  { id: "p1", name: "Marina Balık Restaurant", businessType: "restaurant", status: "completed", featureCount: 24, priceEur: 4820, updatedAt: "2 saat önce", progress: 100, accent: "oklch(0.72 0.16 162)" },
  { id: "p2", name: "Nişantaşı Barber Co.", businessType: "barber", status: "generating", featureCount: 12, priceEur: 2140, updatedAt: "18 dk önce", progress: 62, accent: "oklch(0.72 0.14 40)" },
  { id: "p3", name: "Aegean Boutique Hotel", businessType: "hotel", status: "ready", featureCount: 31, priceEur: 7250, updatedAt: "1 gün önce", progress: 0, accent: "oklch(0.72 0.14 235)" },
  { id: "p4", name: "Kadıköy Kahve Durağı", businessType: "cafe", status: "analyzing", featureCount: 9, priceEur: 1680, updatedAt: "5 dk önce", progress: 0, accent: "oklch(0.75 0.15 60)" },
  { id: "p5", name: "Dr. Yılmaz Diş Kliniği", businessType: "dentist", status: "draft", featureCount: 6, priceEur: 1240, updatedAt: "3 gün önce", progress: 0, accent: "oklch(0.72 0.14 200)" },
  { id: "p6", name: "PowerHouse Gym", businessType: "gym", status: "completed", featureCount: 18, priceEur: 3560, updatedAt: "4 gün önce", progress: 100, accent: "oklch(0.7 0.19 12)" },
];
