"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ScanSearch,
  Phone,
  MapPin,
  Globe,
  Instagram,
  Facebook,
  MessageCircle,
  Star,
  Clock,
  Palette,
  Building2,
  Check,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useWizard } from "@/stores/wizard-store";
import { synthesizeAnalysis, type BusinessAnalysis } from "@/data/mock-analysis";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WizardFooter } from "./wizard-footer";
import { cn, sleep } from "@/lib/utils";

const EXTRACTION_TARGETS = [
  "İşletme adı",
  "Telefon & adres",
  "Çalışma saatleri",
  "Google yorumları & puan",
  "Fotoğraflar",
  "Sosyal medya hesapları",
  "Renk paleti",
  "Kategori & açıklama",
  "Yakındaki işletmeler",
];

function AnalyzingView({ withMaps }: { withMaps: boolean }) {
  const [completed, setCompleted] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      for (let i = 1; i <= EXTRACTION_TARGETS.length; i++) {
        await sleep(230 + Math.random() * 180);
        if (mounted) setCompleted(i);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 py-6">
      <div className="relative grid size-28 place-items-center">
        {[0, 1, 2].map((r) => (
          <motion.span
            key={r}
            className="absolute rounded-full border border-primary/30"
            style={{ inset: r * -14 }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.15, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: r * 0.3 }}
          />
        ))}
        <div className="grid size-16 place-items-center rounded-2xl border border-primary/40 bg-primary-muted">
          <ScanSearch className="size-7 text-primary" />
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-lg font-semibold tracking-tight">
          {withMaps ? "İşletme analiz ediliyor…" : "Şablon hazırlanıyor…"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {withMaps
            ? "Google Maps verileri toplanıyor ve yapılandırılıyor."
            : "Manuel giriş için akıllı bir taslak oluşturuluyor."}
        </p>
      </div>

      <div className="w-full max-w-md space-y-2">
        {EXTRACTION_TARGETS.map((target, i) => {
          const done = i < completed;
          const active = i === completed;
          return (
            <div
              key={target}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors",
                done
                  ? "border-border bg-surface/40 text-foreground"
                  : active
                    ? "border-primary/40 bg-primary-muted text-foreground"
                    : "border-border/60 bg-transparent text-subtle-foreground",
              )}
            >
              <span className="grid size-5 place-items-center">
                {done ? (
                  <Check className="size-4 text-[var(--success)]" strokeWidth={3} />
                ) : active ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current opacity-40" />
                )}
              </span>
              {target}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  icon: IconCmp,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <IconCmp className="size-3.5" /> {label}
      </Label>
      <Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ResultsView({
  analysis,
  update,
}: {
  analysis: BusinessAnalysis;
  update: (patch: Partial<BusinessAnalysis>) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Summary header */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface/50 p-4">
        <div
          className="grid size-14 shrink-0 place-items-center rounded-xl text-lg font-semibold text-white"
          style={{
            background: `linear-gradient(135deg, ${analysis.colorPalette[0]}, ${analysis.colorPalette[1] ?? analysis.colorPalette[0]})`,
          }}
        >
          {analysis.logoText}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold tracking-tight">{analysis.name}</h3>
            <Badge variant="primary">{analysis.category}</Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-[var(--amber)] text-[var(--amber)]" />
              <span className="font-medium text-foreground">{analysis.rating}</span>
              <span className="tabular-nums">({analysis.reviewCount} yorum)</span>
            </span>
          </div>
        </div>
        <Badge variant="success">Analiz tamamlandı</Badge>
      </div>

      {/* Editable grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="İşletme Adı" icon={Building2} value={analysis.name} onChange={(v) => update({ name: v })} />
        <Field label="Kategori" icon={Building2} value={analysis.category} onChange={(v) => update({ category: v })} />
        <Field label="Telefon" icon={Phone} value={analysis.phone} onChange={(v) => update({ phone: v })} />
        <Field label="Adres" icon={MapPin} value={analysis.address} onChange={(v) => update({ address: v })} />
        <Field label="Website" icon={Globe} value={analysis.website} onChange={(v) => update({ website: v })} placeholder="https://" />
        <Field label="Instagram" icon={Instagram} value={analysis.instagram} onChange={(v) => update({ instagram: v })} placeholder="@" />
        <Field label="Facebook" icon={Facebook} value={analysis.facebook} onChange={(v) => update({ facebook: v })} />
        <Field label="WhatsApp" icon={MessageCircle} value={analysis.whatsapp} onChange={(v) => update({ whatsapp: v })} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Kısa Açıklama</Label>
        <Textarea value={analysis.description} onChange={(e) => update({ description: e.target.value })} className="min-h-20" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Opening hours */}
        <div className="rounded-xl border border-border bg-surface/40 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Clock className="size-4 text-muted-foreground" /> Çalışma Saatleri
          </div>
          <div className="space-y-1.5 text-sm">
            {analysis.openingHours.map((h) => (
              <div key={h.day} className="flex items-center justify-between">
                <span className="text-muted-foreground">{h.day}</span>
                <span className={cn("tabular-nums", h.hours === "Kapalı" && "text-subtle-foreground")}>
                  {h.hours}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Palette */}
        <div className="rounded-xl border border-border bg-surface/40 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Palette className="size-4 text-muted-foreground" /> Renk Paleti
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.colorPalette.map((c) => (
              <div key={c} className="flex flex-col items-center gap-1.5">
                <span className="size-10 rounded-lg border border-border" style={{ background: c }} />
                <span className="font-mono text-[10px] text-muted-foreground">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="rounded-xl border border-border bg-surface/40 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Star className="size-4 text-muted-foreground" /> Öne Çıkan Yorumlar
          </div>
          <div className="space-y-2.5">
            {analysis.reviews.slice(0, 2).map((r, i) => (
              <div key={i} className="text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">{r.author}</span>
                  <span className="flex">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} className="size-2.5 fill-[var(--amber)] text-[var(--amber)]" />
                    ))}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-muted-foreground">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nearby */}
      <div className="rounded-xl border border-border bg-surface/40 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
          <MapPin className="size-4 text-muted-foreground" /> Yakındaki İşletmeler
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.nearby.map((n) => (
            <Badge key={n.name} variant="outline" className="gap-1.5">
              {n.name} <span className="text-subtle-foreground">· {n.distance}</span>
            </Badge>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function StepAnalysis() {
  const {
    projectName,
    businessType,
    noMapsUrl,
    analysis,
    analysisStatus,
    setAnalysis,
    setAnalysisStatus,
    updateAnalysis,
    goNext,
    goBack,
  } = useWizard();

  const runAnalysis = React.useCallback(async () => {
    setAnalysisStatus("loading");
    setAnalysis(null);
    await sleep(2400);
    setAnalysis(synthesizeAnalysis(projectName || "İşletme", businessType || "other"));
    setAnalysisStatus("ready");
  }, [projectName, businessType, setAnalysis, setAnalysisStatus]);

  React.useEffect(() => {
    if (analysisStatus === "idle") void runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <AnimatePresence mode="wait">
        {analysisStatus === "loading" || !analysis ? (
          <motion.div key="loading" exit={{ opacity: 0 }}>
            <AnalyzingView withMaps={!noMapsUrl} />
          </motion.div>
        ) : (
          <motion.div key="results">
            <ResultsView analysis={analysis} update={updateAnalysis} />
          </motion.div>
        )}
      </AnimatePresence>

      {analysisStatus === "ready" && analysis && (
        <WizardFooter onBack={goBack} onNext={goNext}>
          <Button type="button" variant="ghost" onClick={runAnalysis}>
            <RefreshCw className="size-4" /> Yeniden Analiz
          </Button>
        </WizardFooter>
      )}
    </div>
  );
}
