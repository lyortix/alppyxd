import Link from "next/link";
import { ArrowRight, Plus, Sparkles, Zap } from "lucide-react";
import { PageHeader, PageShell } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProjectCard } from "@/components/dashboard/project-card";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/misc";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BUSINESS_TYPES } from "@/data/business-types";
import { MOCK_PROJECTS } from "@/data/mock-projects";
import { PROVIDERS } from "@/ai/providers";
import { formatEUR, formatUSD } from "@/lib/format";

const STATS = [
  { label: "Aktif Projeler", value: "18", delta: 12, data: [4, 6, 5, 8, 7, 11, 12, 14, 18], color: "oklch(0.7 0.18 285)" },
  { label: "Bu Ay Üretilen", value: "42", delta: 28, data: [12, 14, 18, 22, 26, 30, 34, 38, 42], color: "oklch(0.72 0.16 162)" },
  { label: "Toplam Gelir", value: formatEUR(184300), delta: 19, data: [80, 96, 104, 120, 138, 150, 168, 176, 184], color: "oklch(0.72 0.14 235)" },
  { label: "AI Maliyeti", value: formatUSD(1284), delta: -6, data: [220, 200, 190, 210, 180, 170, 160, 150, 128], color: "oklch(0.8 0.14 78)" },
];

export default function OverviewPage() {
  const recent = MOCK_PROJECTS.slice(0, 4);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Genel Bakış"
        title="Merhaba, Ajans Ekibi 👋"
        description="Tüm web sitesi üretim operasyonunuz tek ekranda. Yeni bir proje başlatın veya devam eden işleri takip edin."
        actions={
          <Link
            href="/projects/new"
            className={cn(buttonVariants(), "hidden sm:inline-flex")}
          >
            <Plus className="size-4" /> Yeni Proje
          </Link>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </div>

      {/* Main grid */}
      <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent projects */}
        <section className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Son Projeler</h2>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Tümünü gör <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recent.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        </section>

        {/* Right rail */}
        <aside className="space-y-6">
          {/* Quick start */}
          <div className="rounded-xl border border-border bg-card p-5 card-hairline">
            <div className="mb-4 flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              <h3 className="font-semibold tracking-tight">Hızlı Başlat</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {BUSINESS_TYPES.slice(0, 9).map((b) => (
                <Link
                  key={b.id}
                  href={`/projects/new?type=${b.id}`}
                  className="group flex flex-col items-center gap-2 rounded-lg border border-border bg-surface/50 p-3 text-center transition-all hover:border-primary/40 hover:bg-primary-muted"
                >
                  <Icon
                    name={b.icon}
                    className="size-5 text-muted-foreground transition-colors group-hover:text-primary"
                  />
                  <span className="text-[11px] font-medium leading-tight">{b.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* AI providers */}
          <div className="rounded-xl border border-border bg-card p-5 card-hairline">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h3 className="font-semibold tracking-tight">AI Sağlayıcılar</h3>
              </div>
              <Link href="/providers" className="text-xs text-muted-foreground hover:text-foreground">
                Yönet
              </Link>
            </div>
            <div className="space-y-3">
              {PROVIDERS.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: p.accent }}
                  />
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.blurb}</span>
                  <Badge
                    variant={p.available ? "success" : "default"}
                    className="ml-auto"
                  >
                    {p.available ? "Aktif" : "Yakında"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
