"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  CheckCircle2,
  FileArchive,
  Github,
  FileText,
  Images,
  ClipboardList,
  Receipt,
  BarChart3,
  ListChecks,
  Rocket,
  Download,
  ExternalLink,
  Plus,
} from "lucide-react";
import type { PricingBreakdown } from "@/lib/pricing";
import { useWizard } from "@/stores/wizard-store";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatEUR, formatTokens, formatUSD, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

interface OutputItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
  accent: string;
}

const OUTPUTS: OutputItem[] = [
  { id: "zip", icon: FileArchive, title: "ZIP İndir", description: "Tüm proje kaynak kodu, tek pakette.", action: "İndir", accent: "oklch(0.7 0.18 285)" },
  { id: "github", icon: Github, title: "GitHub Deposu", description: "Otomatik oluşturulan özel repo.", action: "Depoyu aç", accent: "oklch(0.9 0.02 265)" },
  { id: "readme", icon: FileText, title: "README", description: "Kurulum ve kullanım dokümantasyonu.", action: "Görüntüle", accent: "oklch(0.72 0.14 235)" },
  { id: "preview", icon: Images, title: "Önizleme Görselleri", description: "Masaüstü ve mobil ekran görüntüleri.", action: "Galeriyi aç", accent: "oklch(0.75 0.15 60)" },
  { id: "summary", icon: ClipboardList, title: "Proje Özeti", description: "İşletme, özellikler ve karar dökümü.", action: "Görüntüle", accent: "oklch(0.72 0.16 162)" },
  { id: "cost", icon: Receipt, title: "AI Maliyet Raporu", description: "Sağlayıcı bazında token ve maliyet.", action: "Görüntüle", accent: "oklch(0.8 0.14 78)" },
  { id: "build", icon: BarChart3, title: "Build Raporu", description: "Üretim süreleri ve performans metrikleri.", action: "Görüntüle", accent: "oklch(0.7 0.14 320)" },
  { id: "checklist", icon: ListChecks, title: "Kontrol Listesi", description: "Teslim öncesi kalite kontrol maddeleri.", action: "Görüntüle", accent: "oklch(0.72 0.14 200)" },
  { id: "deploy", icon: Rocket, title: "Yayına Alma Talimatları", description: "Vercel / sunucu deploy adımları.", action: "Görüntüle", accent: "oklch(0.7 0.19 12)" },
];

export function OutputsView({
  totals,
  projectName,
}: {
  totals: PricingBreakdown;
  projectName: string;
}) {
  const reset = useWizard((s) => s.reset);

  const summary = [
    { label: "Özellik", value: `${totals.featureCount}` },
    { label: "Geliştirme Bedeli", value: formatEUR(totals.devPriceEur) },
    { label: "Üretilen Token", value: formatTokens(totals.totalTokens) },
    { label: "AI Maliyeti", value: formatUSD(totals.aiCostUsd) },
    { label: "Süre", value: formatDuration(totals.buildMinutes) },
    { label: "Ajans Karı", value: formatEUR(totals.agencyProfitEur) },
  ];

  return (
    <div className="space-y-8">
      {/* Success header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-[var(--success)]/30 bg-[oklch(0.72_0.16_162/0.06)] p-6 text-center sm:p-8"
      >
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
          className="relative mx-auto grid size-14 place-items-center rounded-2xl border border-[var(--success)]/40 bg-[oklch(0.72_0.16_162/0.14)]"
        >
          <CheckCircle2 className="size-7 text-[var(--success)]" />
        </motion.div>
        <h3 className="relative mt-4 text-2xl font-semibold tracking-tight">Proje hazır! 🎉</h3>
        <p className="relative mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{projectName}</span> için tüm
          çıktılar üretildi. Aşağıdan indirebilir veya teslim edebilirsiniz.
        </p>

        <div className="relative mx-auto mt-6 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
          {summary.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card/60 p-3">
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
              <p className="mt-0.5 text-base font-semibold tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Outputs grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {OUTPUTS.map((o, i) => (
          <motion.button
            key={o.id}
            type="button"
            onClick={() => toast.success(`${o.title} hazır`, { description: "Bu bir demo çıktısıdır." })}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.04 }}
            className="group flex items-start gap-3.5 rounded-xl border border-border bg-card p-4 text-left card-hairline transition-all hover:border-border-strong hover:shadow-float"
          >
            <span
              className="grid size-10 shrink-0 place-items-center rounded-lg border border-border"
              style={{ background: `color-mix(in oklch, ${o.accent} 14%, transparent)` }}
            >
              <o.icon className="size-5" style={{ color: o.accent }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{o.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {o.description}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                {o.id === "zip" ? <Download className="size-3" /> : <ExternalLink className="size-3" />}
                {o.action}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          Çıktılar 30 gün boyunca çalışma alanınızda saklanır.
        </p>
        <div className="flex items-center gap-2">
          <Link href="/projects" className={cn(buttonVariants({ variant: "secondary" }))}>
            Projelere dön
          </Link>
          <Button onClick={reset}>
            <Plus className="size-4" /> Yeni Proje
          </Button>
        </div>
      </div>
    </div>
  );
}
