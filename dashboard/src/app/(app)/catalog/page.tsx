import { Star } from "lucide-react";
import { PageHeader, PageShell } from "@/components/layout/page-header";
import { Icon } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, FEATURES, featuresByCategory } from "@/features/catalog";
import { formatEUR, formatTokens, formatDuration } from "@/lib/format";

export const metadata = { title: "Özellik Kataloğu" };

const TIER_LABEL: Record<string, string> = {
  essential: "Temel",
  growth: "Büyüme",
  premium: "Premium",
};

export default function CatalogPage() {
  const totalValue = FEATURES.reduce((s, f) => s + f.priceEur, 0);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Kaynaklar"
        title="Özellik Kataloğu"
        description="Projelerde kullanılabilecek tüm modüller. Yeni özellikler yalnızca katalog verisine eklenerek ölçeklenir."
      />

      {/* Summary */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Toplam Özellik", value: `${FEATURES.length}` },
          { label: "Kategori", value: `${CATEGORIES.length}` },
          { label: "Popüler", value: `${FEATURES.filter((f) => f.popular).length}` },
          { label: "Katalog Değeri", value: formatEUR(totalValue) },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 card-hairline">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {CATEGORIES.map((category) => {
          const features = featuresByCategory(category.id);
          return (
            <section
              key={category.id}
              className="overflow-hidden rounded-2xl border border-border bg-card/40 card-hairline"
            >
              <div className="flex items-center gap-3 border-b border-border p-5">
                <span
                  className="grid size-10 place-items-center rounded-lg border border-border"
                  style={{ background: `color-mix(in oklch, ${category.accent} 14%, transparent)` }}
                >
                  <Icon name={category.icon} className="size-5" style={{ color: category.accent }} />
                </span>
                <div>
                  <h2 className="font-semibold tracking-tight">{category.name}</h2>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
                <Badge variant="outline" className="ml-auto">
                  {features.length} özellik
                </Badge>
              </div>

              <div className="divide-y divide-border">
                {features.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-2/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{f.name}</span>
                        {f.popular && (
                          <Star className="size-3 fill-[var(--amber)] text-[var(--amber)]" />
                        )}
                        <Badge variant="default" className="px-1.5 py-0 text-[10px]">
                          {TIER_LABEL[f.tier]}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {f.description}
                      </p>
                    </div>
                    <div className="hidden items-center gap-5 text-xs text-muted-foreground sm:flex">
                      <span className="tabular-nums">{formatDuration(f.devMinutes)}</span>
                      <span className="tabular-nums">{formatTokens(f.tokens)} token</span>
                    </div>
                    <span className="w-20 text-right text-sm font-semibold tabular-nums">
                      {formatEUR(f.priceEur)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
