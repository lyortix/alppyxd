import { BUSINESS_TYPE_MAP } from "./business-types";

/**
 * Business analysis model (Step 2).
 *
 * In production this is populated by the Google Maps / scraping pipeline behind
 * a server action. Here we synthesize a realistic Turkish dataset so the whole
 * flow is demonstrable offline. Every field is editable in the UI.
 */

export interface ReviewSummary {
  author: string;
  rating: number;
  text: string;
}

export interface BusinessAnalysis {
  name: string;
  category: string;
  phone: string;
  address: string;
  openingHours: { day: string; hours: string }[];
  rating: number;
  reviewCount: number;
  reviews: ReviewSummary[];
  photos: string[];
  logoText: string;
  website: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
  menuUrl: string;
  colorPalette: string[];
  description: string;
  nearby: { name: string; type: string; distance: string }[];
}

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const PALETTES: Record<string, string[]> = {
  restaurant: ["#0F5132", "#D4AF37", "#1A1A1A", "#F5F0E6"],
  cafe: ["#6F4E37", "#C8A27C", "#2B2118", "#F3EADD"],
  barber: ["#111111", "#B08D57", "#E5E5E5", "#7A2E2E"],
  clinic: ["#0E7490", "#22D3EE", "#0F172A", "#F0F9FF"],
  hotel: ["#1E293B", "#CBA135", "#0B1220", "#F8FAFC"],
  default: ["#4F46E5", "#22D3EE", "#0F172A", "#F1F5F9"],
};

const SAMPLE_REVIEWS: ReviewSummary[] = [
  { author: "Mehmet A.", rating: 5, text: "Hizmet ve lezzet mükemmeldi, kesinlikle tekrar geleceğim." },
  { author: "Elif K.", rating: 5, text: "Ortam çok şık, personel ilgili. Herkese tavsiye ederim." },
  { author: "Can T.", rating: 4, text: "Genel olarak memnun kaldık, fiyatlar biraz yüksek." },
  { author: "Zeynep D.", rating: 5, text: "İstanbul'un en iyilerinden. Sunum harika." },
];

/**
 * Deterministic pseudo-random from a string so the same project always yields
 * the same "scraped" data.
 */
function seeded(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function synthesizeAnalysis(
  projectName: string,
  businessTypeId: string,
): BusinessAnalysis {
  const rand = seeded(projectName + businessTypeId);
  const type = BUSINESS_TYPE_MAP[businessTypeId];
  const label = type?.label ?? "İşletme";
  const rating = Math.round((4.2 + rand() * 0.7) * 10) / 10;
  const reviewCount = 80 + Math.floor(rand() * 900);
  const phoneTail = String(1000000 + Math.floor(rand() * 8999999)).slice(0, 7);
  const districts = ["Kadıköy", "Beşiktaş", "Nişantaşı", "Alsancak", "Çankaya", "Konak"];
  const district = districts[Math.floor(rand() * districts.length)];
  const palette = PALETTES[businessTypeId] ?? PALETTES.default;
  const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "");

  return {
    name: projectName,
    category: label,
    phone: `+90 5${Math.floor(rand() * 4) + 3}${phoneTail.slice(0, 1)} ${phoneTail.slice(1, 4)} ${phoneTail.slice(4, 6)} ${phoneTail.slice(6)}`,
    address: `${district} Mah. Bağdat Cad. No:${10 + Math.floor(rand() * 200)}, İstanbul`,
    openingHours: DAYS.map((day, i) => ({
      day,
      hours: i === 6 ? "Kapalı" : `09:00 – ${i >= 4 ? "24:00" : "22:00"}`,
    })),
    rating,
    reviewCount,
    reviews: SAMPLE_REVIEWS.slice(0, 3 + Math.floor(rand() * 2)),
    photos: Array.from({ length: 6 }, (_, i) => `photo-${i}`),
    logoText: projectName
      .split(/\s+/)
      .map((w) => w[0]?.toUpperCase())
      .join("")
      .slice(0, 2),
    website: `https://${slug || "isletme"}.com`,
    instagram: `@${slug || "isletme"}`,
    facebook: `facebook.com/${slug || "isletme"}`,
    whatsapp: `+90 5${Math.floor(rand() * 4) + 3}${phoneTail.slice(0, 1)} ${phoneTail.slice(1, 4)} ${phoneTail.slice(4)}`,
    menuUrl: businessTypeId === "restaurant" || businessTypeId === "cafe" ? `https://${slug}.com/menu` : "",
    colorPalette: palette,
    description: `${projectName}, ${district} bölgesinde ${label.toLowerCase()} hizmeti sunan, ${rating} puan ortalamasına sahip köklü bir işletmedir. Kaliteli hizmet anlayışı ve modern konseptiyle öne çıkar.`,
    nearby: [
      { name: "Rakip İşletme 1", type: label, distance: "120 m" },
      { name: "Rakip İşletme 2", type: label, distance: "340 m" },
      { name: "Tamamlayıcı İşletme", type: "Perakende", distance: "80 m" },
    ],
  };
}
