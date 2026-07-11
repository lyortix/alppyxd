# Aurea — AI Web Sitesi Üretim Sistemi

> Ajansımızın işletmeler (restoran, kafe, berber, klinik, otel, avukat, diş
> hekimi, spor salonu, emlak…) için web sitesi üretim hattını yöneten **dahili
> AI operasyon sistemi**. Genel bir SaaS değildir — yalnızca ajans ekibi kullanır.

Arayüz tamamen **Türkçe**, **koyu mod öncelikli** ve Linear / Vercel / Stripe
Dashboard kalitesini hedefleyen premium bir üründür.

---

## Ne yapar?

Projeyi tek tek AI'ya anlatmak yerine, bu panel her şeyi toplar ve üretim
hattını otomatik hazırlar. 5 adımlık akıcı bir sihirbaz üzerinden:

1. **Proje Oluştur** — Proje adı, işletme türü, Google Maps bağlantısı (ya da
   "bağlantım yok").
2. **İşletme Analizi** — Maps verisinden işletme adı, telefon, adres, çalışma
   saatleri, yorumlar, puan, fotoğraflar, sosyal medya, renk paleti, açıklama ve
   yakındaki işletmeler çıkarılır. Yükleme animasyonu → düzenlenebilir sonuçlar.
3. **Özel Talimatlar** — "Lüks tasarım, Rolex yeşili, Apple tarzı, koyu mod…"
   gibi serbest metin. Bu metin üretimde tüm AI promptlarına enjekte edilir.
4. **Özellik Oluşturucu** — Kategorilere ayrılmış, her biri fiyat (€ / ₺),
   geliştirme süresi, tahmini token ve AI maliyeti taşıyan modüler özellik
   kataloğu. 100+ özelliğe ölçeklenecek şekilde tamamen veri-güdümlü.
5. **Fiyatlandırma Özeti** — Yapışkan sağ panel; geliştirme bedeli, token,
   Claude/GPT/Gemini maliyet karşılaştırması, tahmini süre ve **ajans karı**
   gerçek zamanlı hesaplanır.
6. **Üretim** — Analiz → Planlama → Frontend → Backend → Veritabanı → Admin →
   SEO → Optimizasyon → Test → Dokümantasyon → Paketleme → Git → ZIP adımlarını
   canlı token/maliyet sayaçları ve terminal loguyla animasyonlu gösterir.
7. **Çıktılar** — ZIP, GitHub deposu, README, önizleme görselleri, proje özeti,
   AI maliyet raporu, build raporu, kontrol listesi, yayına alma talimatları.

---

## Teknoloji

| Katman        | Seçim                                             |
| ------------- | ------------------------------------------------- |
| Framework     | Next.js 16 (App Router, Server Components, Turbopack) |
| Dil           | TypeScript (strict)                               |
| Stil          | Tailwind CSS v4 — OKLCH token tabanlı tasarım sistemi |
| Bileşenler    | Kendi shadcn-tarzı premium primitive kütüphanemiz |
| Animasyon     | Framer Motion                                     |
| İkonlar       | Lucide                                            |
| Formlar       | React Hook Form + Zod                             |
| Durum         | Zustand (sihirbaz), TanStack Query (sağlayıcı hazır) |
| Tema          | next-themes (koyu varsayılan, açık destekli)      |
| Bildirim      | Sonner                                            |

---

## Mimari & Klasör Yapısı

Temiz mimari: **veri**, **iş mantığı** ve **UI** birbirinden ayrıdır. Fiyatlandırma
ve özellik kataloğu saf veri/fonksiyondur; UI bunları tüketir.

```
src/
├── app/
│   ├── (app)/                 # Uygulama kabuğu (sidebar + topbar) altındaki sayfalar
│   │   ├── page.tsx           # Genel Bakış (KPI, son projeler, hızlı başlat)
│   │   ├── projects/          # Proje listesi + /new sihirbazı
│   │   ├── catalog/           # Özellik kataloğu tarayıcısı
│   │   ├── providers/         # AI sağlayıcılar
│   │   └── settings/          # Ayarlar (fiyat kuru, token oranı…)
│   ├── layout.tsx             # Kök layout: fontlar + providerlar
│   ├── globals.css            # Tasarım sistemi (tokenlar, yardımcılar)
│   └── icon.svg               # Marka favicon
│
├── ai/                        # SAĞLAYICI SOYUTLAMASI
│   ├── types.ts               # Provider/Model/CostEstimate tipleri
│   └── providers.ts           # Kayıt: Claude, GPT, Gemini, DeepSeek, OpenRouter, Groq + estimateCost
│
├── features/                  # ÖZELLİK KATALOĞU (veri-güdümlü)
│   ├── types.ts               # Feature / FeatureCategory
│   └── catalog.ts             # Tüm kategoriler + özellikler + bağımlılık çözümleyici
│
├── lib/
│   ├── pricing.ts             # Saf fiyatlandırma motoru (computePricing)
│   ├── format.ts              # tr-TR para/token/süre biçimlendirme
│   └── utils.ts               # cn, clamp, uid, sleep
│
├── data/
│   ├── business-types.ts      # İşletme türleri + önerilen özellikler
│   ├── pipeline.ts            # Üretim hattı adımları
│   ├── mock-analysis.ts       # Deterministik "Maps analizi" sentezleyici
│   └── mock-projects.ts       # Panel için örnek projeler
│
├── schemas/
│   └── project.ts             # Zod: Adım 1 doğrulaması
│
├── stores/
│   └── wizard-store.ts        # Zustand: tüm sihirbaz durumu + aksiyonlar
│
└── components/
    ├── ui/                    # Primitive'ler: button, card, input, checkbox, switch, badge, misc
    ├── layout/                # sidebar, topbar, logo, page-header, theme-toggle
    ├── providers/             # tema + query + toaster
    ├── dashboard/             # stat-card, sparkline, project-card
    └── wizard/                # stepper, step-*, pricing-sidebar, provider-picker, outputs
```

### Neden bu yapı?

- **Özellik kataloğu tamamen veridir** (`features/catalog.ts`). Yeni bir satılabilir
  özellik eklemek = bir nesne eklemek. UI, fiyatlandırma ve üretim hattı otomatik
  algılar. Böylece 100+ özelliğe bileşene dokunmadan ölçeklenir.
- **Fiyatlandırma saf fonksiyondur** (`lib/pricing.ts`). Test edilebilir ve üretim
  sırasında sunucu tarafında yeniden kullanılabilir.
- **AI sağlayıcıları soyutlanmıştır** (`ai/`). Claude, GPT, Gemini, DeepSeek,
  OpenRouter, Groq ve özel API'ler tek kayıttan gelir; fiyatlandırma ve seçim UI'ı
  sağlayıcıdan bağımsızdır. Yeni model eklemek = kayda satır eklemek.

---

## Özellik Kataloğunu Genişletme

`src/features/catalog.ts` içindeki `FEATURES` dizisine ekleyin:

```ts
{
  id: "loyalty",
  categoryId: "content",          // mevcut bir kategori
  name: "Sadakat Programı",
  description: "Puan biriktirme ve ödül sistemi.",
  priceEur: 340,
  devMinutes: 220,
  tokens: 84000,
  tier: "premium",
  popular: true,
  dependsOn: ["admin-users"],     // opsiyonel bağımlılıklar
  bestFor: ["cafe", "restaurant"],
}
```

Bağımlılıklar otomatik çözümlenir: bir özellik seçilince gereksinimleri de
eklenir; kaldırılınca ona bağlı olanlar da kaldırılır.

## Yeni AI Sağlayıcı Ekleme

`src/ai/providers.ts` içindeki `PROVIDERS` dizisine bir `AIProvider` ekleyin
(fiyatlar 1M token başına USD). `computePricing` ve sağlayıcı seçici anında
kullanır.

---

## Geliştirme

```bash
cd dashboard
npm install
cp .env.example .env.local   # kullanacağınız sağlayıcı anahtarlarını girin
npm run dev                  # http://localhost:3000

npm run build                # production build
npm run typecheck            # tsc --noEmit
```

> Not: Adım 2 analizi ve Adım 6 üretimi şu an **deterministik simülasyondur**
> (`data/mock-analysis.ts` + `data/pipeline.ts`). Gerçek Maps kazıma ve AI üretim
> çağrıları, mevcut soyutlamaların arkasına birer server action olarak takılacak
> şekilde tasarlanmıştır — UI'da değişiklik gerektirmez.

---

## Yol Haritası

- [ ] Gerçek Google Maps analiz server action'ı
- [ ] Gerçek AI üretim hattı (sağlayıcı soyutlaması üzerinden akış)
- [ ] Kalıcı depolama (projeler, ayarlar)
- [ ] Kimlik doğrulama / ekip rolleri (RBAC)
- [ ] ⌘K komut paleti
- [ ] Prompt önizleme & dışa aktarma
