export interface PipelineStep {
  id: string;
  label: string;
  description: string;
  icon: string;
  /** Simulated duration weight — used to pace the generation animation. */
  weight: number;
}

/** The full generation pipeline shown in Step 6. */
export const PIPELINE_STEPS: PipelineStep[] = [
  { id: "analysis", label: "İşletme Analizi", description: "Toplanan veriler doğrulanıyor", icon: "ScanSearch", weight: 1 },
  { id: "planning", label: "Planlama", description: "Sayfa ve modül mimarisi çıkarılıyor", icon: "GitBranch", weight: 1.2 },
  { id: "prompt", label: "Prompt Üretimi", description: "AI için üretim promptları hazırlanıyor", icon: "Wand2", weight: 1 },
  { id: "frontend", label: "Frontend", description: "Arayüz bileşenleri üretiliyor", icon: "LayoutTemplate", weight: 2.4 },
  { id: "backend", label: "Backend", description: "API ve iş mantığı yazılıyor", icon: "Server", weight: 2 },
  { id: "database", label: "Veritabanı", description: "Şema ve migration'lar oluşturuluyor", icon: "Database", weight: 1.3 },
  { id: "admin", label: "Admin Paneli", description: "Yönetim arayüzü kuruluyor", icon: "LayoutDashboard", weight: 1.8 },
  { id: "seo", label: "SEO", description: "Metadata ve yapılandırılmış veri", icon: "Search", weight: 0.9 },
  { id: "optimization", label: "Optimizasyon", description: "Performans ve görsel iyileştirme", icon: "Gauge", weight: 1.1 },
  { id: "testing", label: "Test", description: "Otomatik testler çalıştırılıyor", icon: "FlaskConical", weight: 1.2 },
  { id: "docs", label: "Dokümantasyon", description: "README ve teknik doküman", icon: "FileText", weight: 0.8 },
  { id: "packaging", label: "Paketleme", description: "Bağımlılıklar ve yapı hazırlanıyor", icon: "Package", weight: 0.9 },
  { id: "git", label: "Git", description: "Repo oluşturuluyor, commit atılıyor", icon: "GitCommitHorizontal", weight: 0.7 },
  { id: "zip", label: "ZIP Export", description: "İndirilebilir paket üretiliyor", icon: "FileArchive", weight: 0.6 },
];
