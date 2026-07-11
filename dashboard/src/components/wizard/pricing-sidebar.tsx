"use client";

import { motion } from "framer-motion";
import { Coins, Clock, TrendingUp, Layers, Cpu, Sparkles } from "lucide-react";
import { useWizard } from "@/stores/wizard-store";
import { computePricing } from "@/lib/pricing";
import {
  formatEUR,
  formatTL,
  formatTokens,
  formatDuration,
  formatUSD,
  formatPercent,
} from "@/lib/format";
import { ProviderPicker } from "./provider-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Row({
  icon: IconCmp,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <IconCmp className="size-4" style={accent ? { color: accent } : undefined} />
        {label}
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold tabular-nums">{value}</div>
        {sub && <div className="text-[11px] tabular-nums text-subtle-foreground">{sub}</div>}
      </div>
    </div>
  );
}

export function PricingSidebar({ onGenerate }: { onGenerate?: () => void }) {
  const { selectedFeatureIds, pricing } = useWizard();
  const p = computePricing(selectedFeatureIds, pricing);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-float card-hairline">
      {/* Headline price */}
      <div className="pb-4">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
          Geliştirme Bedeli
        </p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <motion.span
            key={p.devPriceEur}
            initial={{ opacity: 0.4, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-semibold tracking-tight tabular-nums"
          >
            {formatEUR(p.devPriceEur)}
          </motion.span>
        </div>
        <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">{formatTL(p.devPriceTl)}</p>
      </div>

      <div className="border-t border-border" />

      {/* Metrics */}
      <div className="divide-y divide-border">
        <Row icon={Layers} label="Seçili Özellik" value={`${p.featureCount}`} />
        <Row
          icon={Coins}
          label="Tahmini AI Token"
          value={formatTokens(p.totalTokens)}
          sub={`${formatTokens(p.inputTokens)} girdi · ${formatTokens(p.outputTokens)} çıktı`}
        />
        <Row icon={Clock} label="Tahmini Süre" value={formatDuration(p.buildMinutes)} />
      </div>

      {/* Provider comparison */}
      <div className="mt-4 rounded-xl border border-border bg-surface/40 p-3">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle-foreground">
          <Cpu className="size-3.5" /> AI Maliyet Karşılaştırması
        </div>
        <div className="space-y-2">
          {p.providerCosts.map((c) => (
            <div key={c.label} className="flex items-center gap-2.5">
              <span className="size-2 rounded-full" style={{ background: c.accent }} />
              <span className="text-sm">{c.label}</span>
              <span className="ml-auto text-sm font-medium tabular-nums">{formatUSD(c.usd)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Provider picker */}
      <div className="mt-4 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-subtle-foreground">
          Birincil Sağlayıcı
        </p>
        <ProviderPicker />
      </div>

      {/* Profit */}
      <div className="mt-4 rounded-xl border border-[oklch(0.72_0.16_162/0.3)] bg-[oklch(0.72_0.16_162/0.08)] p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--success)]">
            <TrendingUp className="size-4" /> Ajans Karı
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold tabular-nums text-[var(--success)]">
              {formatEUR(p.agencyProfitEur)}
            </div>
            <div className="text-[11px] tabular-nums text-[var(--success)]/80">
              {formatPercent(p.marginPct)} marj
            </div>
          </div>
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Seçili sağlayıcı AI maliyeti: {formatUSD(p.aiCostUsd)} (~{formatEUR(p.aiCostEur, true)})
        </p>
      </div>

      {onGenerate && (
        <Button
          className={cn("mt-4 w-full", "h-11")}
          size="lg"
          onClick={onGenerate}
          disabled={p.featureCount === 0}
        >
          <Sparkles className="size-4" /> Projeyi Üret
        </Button>
      )}
    </div>
  );
}
