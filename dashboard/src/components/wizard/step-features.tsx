"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Star,
  ChevronDown,
  Clock,
  Coins,
  Sparkles,
  Wand2,
  Eraser,
  Link2,
} from "lucide-react";
import {
  CATEGORIES,
  FEATURES,
  featuresByCategory,
  FEATURE_MAP,
} from "@/features/catalog";
import type { Feature, FeatureTier } from "@/features/types";
import { useWizard } from "@/stores/wizard-store";
import { BUSINESS_TYPE_MAP } from "@/data/business-types";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { WizardFooter } from "./wizard-footer";
import { PricingSidebar } from "./pricing-sidebar";
import { formatEUR, formatTL, formatTokens, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

const TIER_META: Record<FeatureTier, { label: string; variant: "default" | "primary" | "warning" }> = {
  essential: { label: "Temel", variant: "default" },
  growth: { label: "Büyüme", variant: "primary" },
  premium: { label: "Premium", variant: "warning" },
};

const TIER_FILTERS: { id: FeatureTier | "all"; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "essential", label: "Temel" },
  { id: "growth", label: "Büyüme" },
  { id: "premium", label: "Premium" },
];

function FeatureRow({
  feature,
  selected,
  onToggle,
  eurToTl,
}: {
  feature: Feature;
  selected: boolean;
  onToggle: () => void;
  eurToTl: number;
}) {
  const deps = feature.dependsOn?.map((d) => FEATURE_MAP[d]?.name).filter(Boolean) ?? [];
  return (
    <div
      onClick={onToggle}
      className={cn(
        "group flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all",
        selected
          ? "border-primary/40 bg-primary-muted/40"
          : "border-border bg-surface/30 hover:border-border-strong hover:bg-surface-2",
      )}
    >
      <Checkbox checked={selected} onCheckedChange={onToggle} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{feature.name}</span>
          <Badge variant={TIER_META[feature.tier].variant} className="px-1.5 py-0 text-[10px]">
            {TIER_META[feature.tier].label}
          </Badge>
          {feature.popular && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[var(--amber)]">
              <Star className="size-2.5 fill-current" /> Popüler
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {feature.description}
        </p>
        {deps.length > 0 && (
          <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-subtle-foreground">
            <Link2 className="size-2.5" /> Gerektirir: {deps.join(", ")}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1 text-right">
        <span className="text-sm font-semibold tabular-nums">{formatEUR(feature.priceEur)}</span>
        <span className="text-[11px] tabular-nums text-subtle-foreground">
          {formatTL(Math.round(feature.priceEur * eurToTl))}
        </span>
        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-0.5">
            <Clock className="size-2.5" /> {formatDuration(feature.devMinutes)}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Coins className="size-2.5" /> {formatTokens(feature.tokens)}
          </span>
        </div>
      </div>
    </div>
  );
}

function CategorySection({
  categoryId,
  query,
  tier,
  popularOnly,
  selectedIds,
  onToggle,
  onToggleAll,
  eurToTl,
}: {
  categoryId: string;
  query: string;
  tier: FeatureTier | "all";
  popularOnly: boolean;
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[], select: boolean) => void;
  eurToTl: number;
}) {
  const [open, setOpen] = React.useState(true);
  const category = CATEGORIES.find((c) => c.id === categoryId)!;
  const q = query.trim().toLowerCase();

  const features = featuresByCategory(categoryId).filter((f) => {
    if (tier !== "all" && f.tier !== tier) return false;
    if (popularOnly && !f.popular) return false;
    if (q && !`${f.name} ${f.description}`.toLowerCase().includes(q)) return false;
    return true;
  });

  if (features.length === 0) return null;

  const ids = features.map((f) => f.id);
  const selectedCount = ids.filter((id) => selectedIds.includes(id)).length;
  const allSelected = selectedCount === ids.length;
  const someSelected = selectedCount > 0 && !allSelected;

  return (
    <section className="rounded-2xl border border-border bg-card/40 card-hairline">
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-border"
            style={{ background: `color-mix(in oklch, ${category.accent} 14%, transparent)` }}
          >
            <Icon name={category.icon} className="size-4.5" style={{ color: category.accent }} />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="font-semibold tracking-tight">{category.name}</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {selectedCount}/{ids.length}
              </span>
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {category.description}
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => onToggleAll(ids, !allSelected)}
          className="hidden text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
        >
          {allSelected ? "Kaldır" : "Tümünü seç"}
        </button>
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onCheckedChange={() => onToggleAll(ids, !allSelected)}
        />
        <button type="button" onClick={() => setOpen((o) => !o)}>
          <ChevronDown
            className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-2.5 p-4 pt-0 xl:grid-cols-2">
              {features.map((f) => (
                <FeatureRow
                  key={f.id}
                  feature={f}
                  selected={selectedIds.includes(f.id)}
                  onToggle={() => onToggle(f.id)}
                  eurToTl={eurToTl}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export function StepFeatures({ onGenerate }: { onGenerate: () => void }) {
  const {
    selectedFeatureIds,
    toggleFeature,
    setFeatures,
    addFeatures,
    businessType,
    pricing,
    goBack,
  } = useWizard();

  const [query, setQuery] = React.useState("");
  const [tier, setTier] = React.useState<FeatureTier | "all">("all");
  const [popularOnly, setPopularOnly] = React.useState(false);

  const suggested = BUSINESS_TYPE_MAP[businessType]?.suggestedFeatures ?? [];

  const toggleAll = (ids: string[], select: boolean) => {
    if (select) addFeatures(ids);
    else setFeatures(selectedFeatureIds.filter((id) => !ids.includes(id)));
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_336px]">
      {/* Left: builder */}
      <div className="min-w-0 space-y-4">
        {/* Toolbar */}
        <div className="sticky top-15 z-10 -mx-1 space-y-3 rounded-xl border border-border bg-background/80 p-3 backdrop-blur-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Özellik ara…"
                className="h-9 pl-9"
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface/50 p-0.5">
              {TIER_FILTERS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTier(t.id)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    tier === t.id
                      ? "bg-surface-2 text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPopularOnly((p) => !p)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                popularOnly
                  ? "border-[var(--amber)]/40 bg-[oklch(0.8_0.14_78/0.12)] text-[var(--amber)]"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <Star className={cn("size-3", popularOnly && "fill-current")} /> Popüler
            </button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => addFeatures(FEATURES.filter((f) => f.popular).map((f) => f.id))}
            >
              <Sparkles className="size-3.5" /> Popülerleri ekle
            </Button>
            {suggested.length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => addFeatures(suggested)}>
                <Wand2 className="size-3.5" /> Önerilenleri uygula
              </Button>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={() => setFeatures([])}>
              <Eraser className="size-3.5" /> Temizle
            </Button>
            <span className="ml-auto text-xs tabular-nums text-muted-foreground">
              {selectedFeatureIds.length} seçili
            </span>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          {CATEGORIES.map((c) => (
            <CategorySection
              key={c.id}
              categoryId={c.id}
              query={query}
              tier={tier}
              popularOnly={popularOnly}
              selectedIds={selectedFeatureIds}
              onToggle={toggleFeature}
              onToggleAll={toggleAll}
              eurToTl={pricing.eurToTl}
            />
          ))}
        </div>

        <WizardFooter onBack={goBack} hideBack={false} />
      </div>

      {/* Right: pricing (sticky) */}
      <aside className="lg:sticky lg:top-20 lg:h-fit">
        <PricingSidebar onGenerate={onGenerate} />
      </aside>
    </div>
  );
}
