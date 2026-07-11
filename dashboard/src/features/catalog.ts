import type { Feature, FeatureCategory } from "./types";

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export const CATEGORIES: FeatureCategory[] = [
  {
    id: "landing",
    name: "Açılış & Tasarım",
    description: "Ziyaretçinin ilk gördüğü her şey — bölümler, animasyonlar, kimlik.",
    icon: "LayoutTemplate",
    accent: "oklch(0.7 0.18 285)",
  },
  {
    id: "menu",
    name: "Menü",
    description: "Restoran, kafe ve mekanlar için dijital menü çözümleri.",
    icon: "UtensilsCrossed",
    accent: "oklch(0.75 0.15 60)",
  },
  {
    id: "reservation",
    name: "Rezervasyon",
    description: "Uçtan uca rezervasyon akışı, onay ve müşteri yönetimi.",
    icon: "CalendarClock",
    accent: "oklch(0.72 0.14 235)",
  },
  {
    id: "admin",
    name: "Yönetim Paneli",
    description: "İşletmenin siteyi kendi yönetebileceği güçlü admin arayüzü.",
    icon: "LayoutDashboard",
    accent: "oklch(0.72 0.16 162)",
  },
  {
    id: "seo",
    name: "SEO & Analitik",
    description: "Google'da görünürlük, zengin sonuçlar ve ölçümleme.",
    icon: "Search",
    accent: "oklch(0.75 0.15 130)",
  },
  {
    id: "performance",
    name: "Performans & Erişilebilirlik",
    description: "Hız, PWA, çoklu dil ve yasal uyumluluk katmanı.",
    icon: "Gauge",
    accent: "oklch(0.72 0.16 200)",
  },
  {
    id: "notifications",
    name: "Güvenlik & Bildirimler",
    description: "Güvenlik sertleştirmesi ve çok kanallı bildirim entegrasyonları.",
    icon: "BellRing",
    accent: "oklch(0.7 0.19 12)",
  },
  {
    id: "content",
    name: "İçerik & CMS",
    description: "Blog, kariyer, ekip ve satış odaklı içerik modülleri.",
    icon: "FileText",
    accent: "oklch(0.7 0.16 320)",
  },
];

/* ------------------------------------------------------------------ */
/* Features                                                            */
/* ------------------------------------------------------------------ */

export const FEATURES: Feature[] = [
  /* ---- Landing ---------------------------------------------------- */
  { id: "hero", categoryId: "landing", name: "Hero Bölümü", description: "Etkileyici üst alan, başlık, alt başlık ve çağrı butonları.", priceEur: 180, devMinutes: 90, tokens: 42000, tier: "essential", popular: true, defaultOn: true },
  { id: "about", categoryId: "landing", name: "Hakkımızda", description: "İşletmenin hikayesini anlatan bölüm, görsel ve metin düzeni.", priceEur: 120, devMinutes: 60, tokens: 28000, tier: "essential", popular: true, defaultOn: true },
  { id: "services", categoryId: "landing", name: "Hizmetler / Ürünler", description: "Kart tabanlı hizmet veya ürün vitrini.", priceEur: 160, devMinutes: 80, tokens: 34000, tier: "essential", popular: true, defaultOn: true },
  { id: "gallery", categoryId: "landing", name: "Galeri", description: "Lightbox destekli, optimize edilmiş görsel galerisi.", priceEur: 150, devMinutes: 75, tokens: 30000, tier: "growth", popular: true },
  { id: "testimonials", categoryId: "landing", name: "Yorumlar & Referanslar", description: "Müşteri yorumları karuseli, yıldız puanları.", priceEur: 140, devMinutes: 70, tokens: 26000, tier: "growth" },
  { id: "faq", categoryId: "landing", name: "Sıkça Sorulan Sorular", description: "Akordeon yapıda SSS bölümü, schema uyumlu.", priceEur: 90, devMinutes: 45, tokens: 18000, tier: "essential" },
  { id: "contact", categoryId: "landing", name: "İletişim Bölümü", description: "İletişim formu, harita ve iletişim bilgileri.", priceEur: 150, devMinutes: 75, tokens: 32000, tier: "essential", popular: true, defaultOn: true },
  { id: "map", categoryId: "landing", name: "Harita Entegrasyonu", description: "Google Maps gömülü konum ve yol tarifi.", priceEur: 80, devMinutes: 40, tokens: 14000, tier: "essential", dependsOn: ["contact"] },
  { id: "animations", categoryId: "landing", name: "Premium Animasyonlar", description: "Scroll animasyonları, mikro etkileşimler, akıcı geçişler.", priceEur: 240, devMinutes: 140, tokens: 52000, tier: "premium", popular: true },

  /* ---- Menu ------------------------------------------------------- */
  { id: "digital-menu", categoryId: "menu", name: "Dijital Menü", description: "Kategorili, fiyatlı, görselli interaktif menü.", priceEur: 280, devMinutes: 160, tokens: 60000, tier: "growth", popular: true, bestFor: ["restaurant", "cafe"] },
  { id: "pdf-menu", categoryId: "menu", name: "PDF Menü", description: "Yazdırılabilir PDF menü indirme ve görüntüleme.", priceEur: 110, devMinutes: 55, tokens: 20000, tier: "essential", bestFor: ["restaurant", "cafe"] },
  { id: "qr-menu", categoryId: "menu", name: "QR Menü", description: "Masaya özel QR kod ile açılan mobil menü.", priceEur: 160, devMinutes: 85, tokens: 30000, tier: "growth", popular: true, bestFor: ["restaurant", "cafe"], dependsOn: ["digital-menu"] },
  { id: "menu-filters", categoryId: "menu", name: "Kategori Filtreleri", description: "Vegan, glutensiz, kampanya gibi hızlı filtreler.", priceEur: 120, devMinutes: 60, tokens: 22000, tier: "growth", dependsOn: ["digital-menu"] },

  /* ---- Reservation ------------------------------------------------ */
  { id: "reservation-system", categoryId: "reservation", name: "Rezervasyon Sistemi", description: "Tarih/saat seçimli, kişi sayılı uçtan uca rezervasyon.", priceEur: 620, devMinutes: 520, tokens: 180000, tier: "growth", popular: true, bestFor: ["restaurant", "cafe", "barber", "clinic", "hotel", "dentist"] },
  { id: "time-suggestions", categoryId: "reservation", name: "Uygun Saat Önerileri", description: "Doluluk durumuna göre akıllı saat önerileri.", priceEur: 180, devMinutes: 120, tokens: 44000, tier: "premium", dependsOn: ["reservation-system"] },
  { id: "reservation-approval", categoryId: "reservation", name: "Admin Onayı", description: "Rezervasyonların panelden onay/ret akışı.", priceEur: 160, devMinutes: 100, tokens: 38000, tier: "growth", dependsOn: ["reservation-system"] },
  { id: "working-hours", categoryId: "reservation", name: "Çalışma Saatleri", description: "Gün bazlı açık/kapalı saat tanımlama.", priceEur: 120, devMinutes: 70, tokens: 26000, tier: "essential", dependsOn: ["reservation-system"] },
  { id: "reservation-limits", categoryId: "reservation", name: "Rezervasyon Limitleri", description: "Saat başına maksimum kapasite kontrolü.", priceEur: 130, devMinutes: 75, tokens: 28000, tier: "growth", dependsOn: ["reservation-system"] },
  { id: "customer-notes", categoryId: "reservation", name: "Müşteri Notları", description: "Müşterinin özel istek ve notları.", priceEur: 80, devMinutes: 45, tokens: 16000, tier: "essential", dependsOn: ["reservation-system"] },
  { id: "food-selection", categoryId: "reservation", name: "Yemek Seçimi", description: "Rezervasyonda önceden yemek seçimi.", priceEur: 170, devMinutes: 110, tokens: 40000, tier: "premium", dependsOn: ["reservation-system"], bestFor: ["restaurant"] },
  { id: "drink-selection", categoryId: "reservation", name: "İçecek Seçimi", description: "Rezervasyonda önceden içecek seçimi.", priceEur: 130, devMinutes: 80, tokens: 30000, tier: "premium", dependsOn: ["reservation-system"], bestFor: ["restaurant", "cafe"] },

  /* ---- Admin ------------------------------------------------------ */
  { id: "admin-analytics", categoryId: "admin", name: "Analitik Paneli", description: "Ziyaret, dönüşüm ve rezervasyon grafikleri.", priceEur: 320, devMinutes: 220, tokens: 78000, tier: "growth", popular: true },
  { id: "admin-reservations", categoryId: "admin", name: "Rezervasyon Yönetimi", description: "Takvim görünümlü rezervasyon yönetim ekranı.", priceEur: 280, devMinutes: 190, tokens: 70000, tier: "growth", dependsOn: ["reservation-system"] },
  { id: "admin-menu", categoryId: "admin", name: "Menü Yöneticisi", description: "Ürün ekle/düzenle/sırala, stok durumu.", priceEur: 260, devMinutes: 180, tokens: 66000, tier: "growth", dependsOn: ["digital-menu"] },
  { id: "admin-gallery", categoryId: "admin", name: "Galeri Yöneticisi", description: "Görsel yükleme, sıralama ve silme.", priceEur: 180, devMinutes: 110, tokens: 42000, tier: "growth", dependsOn: ["gallery"] },
  { id: "admin-blog", categoryId: "admin", name: "Blog Yöneticisi", description: "Zengin metin editörü ile yazı yönetimi.", priceEur: 300, devMinutes: 200, tokens: 74000, tier: "growth", dependsOn: ["blog"] },
  { id: "admin-theme", categoryId: "admin", name: "Tema Yöneticisi", description: "Renk, font ve logo ayarlarını panelden değiştir.", priceEur: 240, devMinutes: 150, tokens: 56000, tier: "premium" },
  { id: "admin-users", categoryId: "admin", name: "Kullanıcı Yönetimi", description: "Ekip üyeleri, davet ve hesap yönetimi.", priceEur: 220, devMinutes: 140, tokens: 52000, tier: "growth" },
  { id: "admin-roles", categoryId: "admin", name: "Rol & Yetkiler", description: "Rol bazlı erişim kontrolü (RBAC).", priceEur: 260, devMinutes: 170, tokens: 60000, tier: "premium", dependsOn: ["admin-users"] },
  { id: "admin-notifications", categoryId: "admin", name: "Panel Bildirimleri", description: "Yeni rezervasyon/mesajlarda anlık bildirim.", priceEur: 150, devMinutes: 95, tokens: 34000, tier: "growth" },

  /* ---- SEO -------------------------------------------------------- */
  { id: "seo-metadata", categoryId: "seo", name: "Metadata", description: "Sayfa başlıkları, açıklamalar ve canonical.", priceEur: 90, devMinutes: 45, tokens: 16000, tier: "essential", popular: true, defaultOn: true },
  { id: "seo-schema", categoryId: "seo", name: "Schema.org", description: "LocalBusiness, Menu, Review yapılandırılmış veri.", priceEur: 140, devMinutes: 80, tokens: 30000, tier: "growth", popular: true },
  { id: "seo-sitemap", categoryId: "seo", name: "Sitemap", description: "Otomatik oluşturulan XML site haritası.", priceEur: 60, devMinutes: 30, tokens: 10000, tier: "essential", defaultOn: true },
  { id: "seo-robots", categoryId: "seo", name: "Robots.txt", description: "Arama motoru tarama kuralları.", priceEur: 40, devMinutes: 20, tokens: 8000, tier: "essential", defaultOn: true },
  { id: "seo-og", categoryId: "seo", name: "OpenGraph", description: "Sosyal paylaşımlar için zengin önizleme.", priceEur: 80, devMinutes: 40, tokens: 14000, tier: "essential", popular: true },
  { id: "seo-twitter", categoryId: "seo", name: "Twitter Cards", description: "X/Twitter paylaşım kartları.", priceEur: 60, devMinutes: 30, tokens: 10000, tier: "essential" },
  { id: "seo-ga", categoryId: "seo", name: "Google Analytics", description: "GA4 ölçümleme entegrasyonu.", priceEur: 80, devMinutes: 40, tokens: 14000, tier: "essential", popular: true },
  { id: "seo-search-console", categoryId: "seo", name: "Search Console", description: "Doğrulama ve indeksleme takibi.", priceEur: 60, devMinutes: 30, tokens: 9000, tier: "essential" },
  { id: "seo-pixel", categoryId: "seo", name: "Meta Pixel", description: "Facebook/Instagram reklam pikseli.", priceEur: 90, devMinutes: 45, tokens: 15000, tier: "growth" },

  /* ---- Performance ------------------------------------------------ */
  { id: "perf-images", categoryId: "performance", name: "Görsel Optimizasyonu", description: "Otomatik boyutlandırma, WebP/AVIF dönüşümü.", priceEur: 120, devMinutes: 65, tokens: 24000, tier: "essential", popular: true, defaultOn: true },
  { id: "perf-lazy", categoryId: "performance", name: "Lazy Loading", description: "Görsel ve bileşenlerin tembel yüklenmesi.", priceEur: 70, devMinutes: 35, tokens: 12000, tier: "essential", defaultOn: true },
  { id: "perf-a11y", categoryId: "performance", name: "Erişilebilirlik (WCAG)", description: "Klavye, ekran okuyucu ve kontrast uyumu.", priceEur: 180, devMinutes: 120, tokens: 40000, tier: "growth", popular: true },
  { id: "perf-pwa", categoryId: "performance", name: "PWA", description: "Ana ekrana eklenebilir, çevrimdışı destekli uygulama.", priceEur: 220, devMinutes: 150, tokens: 50000, tier: "premium" },
  { id: "perf-dark", categoryId: "performance", name: "Karanlık Mod", description: "Sistem uyumlu koyu tema.", priceEur: 110, devMinutes: 60, tokens: 22000, tier: "growth", popular: true },
  { id: "perf-light", categoryId: "performance", name: "Aydınlık Mod", description: "Açık renk tema desteği.", priceEur: 90, devMinutes: 50, tokens: 18000, tier: "growth" },
  { id: "perf-i18n", categoryId: "performance", name: "Çoklu Dil", description: "TR/EN ve daha fazlası için i18n altyapısı.", priceEur: 260, devMinutes: 180, tokens: 62000, tier: "premium", bestFor: ["hotel", "restaurant"] },
  { id: "perf-cookie", categoryId: "performance", name: "Çerez Banner'ı", description: "Çerez onayı ve tercih yönetimi.", priceEur: 90, devMinutes: 45, tokens: 16000, tier: "essential" },
  { id: "perf-gdpr", categoryId: "performance", name: "KVKK / GDPR", description: "Veri politikası, onay metinleri ve uyumluluk.", priceEur: 140, devMinutes: 80, tokens: 28000, tier: "growth", popular: true },

  /* ---- Notifications & Security ----------------------------------- */
  { id: "sec-hardening", categoryId: "notifications", name: "Güvenlik Sertleştirme", description: "Rate limit, CSP başlıkları, input doğrulama.", priceEur: 200, devMinutes: 130, tokens: 46000, tier: "growth", popular: true, defaultOn: true },
  { id: "notif-email", categoryId: "notifications", name: "E-posta Bildirimleri", description: "Rezervasyon/iletişim için otomatik e-posta.", priceEur: 160, devMinutes: 100, tokens: 36000, tier: "growth", popular: true },
  { id: "notif-whatsapp", categoryId: "notifications", name: "WhatsApp Bildirimleri", description: "WhatsApp Business API ile anlık mesaj.", priceEur: 240, devMinutes: 160, tokens: 56000, tier: "premium", popular: true },
  { id: "notif-telegram", categoryId: "notifications", name: "Telegram Bildirimleri", description: "Ekip için Telegram bot bildirimleri.", priceEur: 140, devMinutes: 85, tokens: 30000, tier: "growth" },
  { id: "sec-backups", categoryId: "notifications", name: "Otomatik Yedekleme", description: "Zamanlanmış veritabanı ve içerik yedeği.", priceEur: 150, devMinutes: 90, tokens: 32000, tier: "growth" },

  /* ---- Content & CMS ---------------------------------------------- */
  { id: "cms", categoryId: "content", name: "İçerik Yönetimi (CMS)", description: "Sayfa ve bölümleri koda dokunmadan düzenle.", priceEur: 360, devMinutes: 260, tokens: 92000, tier: "premium", popular: true },
  { id: "blog", categoryId: "content", name: "Blog", description: "SEO uyumlu blog listesi ve yazı sayfaları.", priceEur: 260, devMinutes: 170, tokens: 62000, tier: "growth", popular: true },
  { id: "career", categoryId: "content", name: "Kariyer Sayfası", description: "İş ilanları ve başvuru formu.", priceEur: 180, devMinutes: 110, tokens: 40000, tier: "growth", bestFor: ["hotel", "clinic"] },
  { id: "team", categoryId: "content", name: "Ekip Sayfası", description: "Ekip üyeleri, roller ve sosyal bağlantılar.", priceEur: 140, devMinutes: 75, tokens: 28000, tier: "essential", bestFor: ["clinic", "lawyer", "dentist"] },
  { id: "pricing", categoryId: "content", name: "Fiyatlandırma Tablosu", description: "Paket/plan karşılaştırma tablosu.", priceEur: 160, devMinutes: 90, tokens: 34000, tier: "growth" },
  { id: "newsletter", categoryId: "content", name: "Bülten Aboneliği", description: "E-posta toplama ve entegrasyon.", priceEur: 120, devMinutes: 65, tokens: 24000, tier: "growth" },
  { id: "ai-chat", categoryId: "content", name: "AI Sohbet Asistanı", description: "İşletmeye özel eğitilmiş yapay zeka chatbot.", priceEur: 420, devMinutes: 280, tokens: 110000, tier: "premium", popular: true },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const FEATURE_MAP: Record<string, Feature> = Object.fromEntries(
  FEATURES.map((f) => [f.id, f]),
);

export function featuresByCategory(categoryId: string): Feature[] {
  return FEATURES.filter((f) => f.categoryId === categoryId);
}

export function defaultSelectedFeatureIds(): string[] {
  return FEATURES.filter((f) => f.defaultOn).map((f) => f.id);
}

/** Given selected ids, return ids that also need enabling to satisfy deps. */
export function resolveDependencies(selectedIds: string[]): string[] {
  const set = new Set(selectedIds);
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of Array.from(set)) {
      const deps = FEATURE_MAP[id]?.dependsOn ?? [];
      for (const dep of deps) {
        if (!set.has(dep)) {
          set.add(dep);
          changed = true;
        }
      }
    }
  }
  return Array.from(set);
}

/** Features whose dependencies are broken if `id` is removed. */
export function dependentsOf(id: string): Feature[] {
  return FEATURES.filter((f) => f.dependsOn?.includes(id));
}
