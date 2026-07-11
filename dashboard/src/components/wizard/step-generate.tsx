"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { PIPELINE_STEPS } from "@/data/pipeline";
import { useWizard } from "@/stores/wizard-store";
import { computePricing } from "@/lib/pricing";
import { Icon } from "@/components/ui/misc";
import { formatTokens, formatUSD, formatEUR } from "@/lib/format";
import { sleep, cn } from "@/lib/utils";
import { OutputsView } from "./outputs";

type StepStatus = "pending" | "active" | "done";

export function StepGenerate() {
  const { selectedFeatureIds, pricing, generationStatus, setGenerationStatus, projectName } =
    useWizard();
  const totals = React.useMemo(
    () => computePricing(selectedFeatureIds, pricing),
    [selectedFeatureIds, pricing],
  );

  const [statuses, setStatuses] = React.useState<StepStatus[]>(
    () => PIPELINE_STEPS.map(() => "pending"),
  );
  const [tokens, setTokens] = React.useState(0);
  const [cost, setCost] = React.useState(0);
  const [log, setLog] = React.useState<string[]>([]);
  const logRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (generationStatus !== "idle") return;
    let mounted = true;
    setGenerationStatus("running");

    (async () => {
      const totalWeight = PIPELINE_STEPS.reduce((s, x) => s + x.weight, 0);
      let accWeight = 0;
      for (let i = 0; i < PIPELINE_STEPS.length; i++) {
        if (!mounted) return;
        const step = PIPELINE_STEPS[i];
        setStatuses((prev) => prev.map((s, idx) => (idx === i ? "active" : s)));
        setLog((prev) => [...prev, `▸ ${step.label}: ${step.description}`]);

        const duration = 380 + step.weight * 460;
        const start = performance.now();
        const startTokens = accWeight / totalWeight;
        accWeight += step.weight;
        const endTokens = accWeight / totalWeight;

        // Animate token/cost counters during this step.
        await new Promise<void>((resolve) => {
          const tick = () => {
            const t = Math.min(1, (performance.now() - start) / duration);
            const frac = startTokens + (endTokens - startTokens) * t;
            setTokens(Math.round(totals.totalTokens * frac));
            setCost(totals.aiCostUsd * frac);
            if (t < 1 && mounted) requestAnimationFrame(tick);
            else resolve();
          };
          requestAnimationFrame(tick);
        });

        if (!mounted) return;
        setStatuses((prev) => prev.map((s, idx) => (idx === i ? "done" : s)));
        setLog((prev) => [...prev, `✓ ${step.label} tamamlandı`]);
      }
      if (!mounted) return;
      setTokens(totals.totalTokens);
      setCost(totals.aiCostUsd);
      await sleep(500);
      if (mounted) setGenerationStatus("done");
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [log]);

  const doneCount = statuses.filter((s) => s === "done").length;
  const overall = Math.round((doneCount / PIPELINE_STEPS.length) * 100);

  if (generationStatus === "done") {
    return <OutputsView totals={totals} projectName={projectName || "Proje"} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="grid size-12 place-items-center rounded-2xl border border-primary/40 bg-primary-muted"
        >
          <Sparkles className="size-6 text-primary" />
        </motion.div>
        <h3 className="text-xl font-semibold tracking-tight">Proje üretiliyor…</h3>
        <p className="text-sm text-muted-foreground">
          {projectName} için tüm üretim hattı çalışıyor.
        </p>
      </div>

      {/* Overall progress */}
      <div className="mx-auto flex max-w-2xl items-center gap-4">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[oklch(0.7_0.18_285)] to-[oklch(0.72_0.14_235)]"
            animate={{ width: `${overall}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>
        <span className="w-10 text-right text-sm font-semibold tabular-nums">{overall}%</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Pipeline steps */}
        <div className="relative">
          <div className="absolute bottom-6 left-[22px] top-6 w-px bg-border" />
          <div className="space-y-1">
            {PIPELINE_STEPS.map((step, i) => {
              const status = statuses[i];
              return (
                <div key={step.id} className="relative flex items-center gap-3.5 py-2">
                  <div
                    className={cn(
                      "relative z-10 grid size-11 shrink-0 place-items-center rounded-xl border transition-all duration-300",
                      status === "done" && "border-[var(--success)]/40 bg-[oklch(0.72_0.16_162/0.12)]",
                      status === "active" && "border-primary/50 bg-primary-muted",
                      status === "pending" && "border-border bg-surface/40",
                    )}
                  >
                    {status === "done" ? (
                      <Check className="size-5 text-[var(--success)]" strokeWidth={2.5} />
                    ) : status === "active" ? (
                      <Loader2 className="size-5 animate-spin text-primary" />
                    ) : (
                      <Icon name={step.icon} className="size-5 text-subtle-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium transition-colors",
                        status === "pending" ? "text-subtle-foreground" : "text-foreground",
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{step.description}</p>
                  </div>
                  {status === "active" && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[11px] font-medium text-primary"
                    >
                      çalışıyor…
                    </motion.span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live metrics + log */}
        <aside className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4 card-hairline">
              <p className="text-xs text-muted-foreground">Üretilen Token</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{formatTokens(tokens)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 card-hairline">
              <p className="text-xs text-muted-foreground">AI Maliyeti</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{formatUSD(cost)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-[#0a0b10] p-1">
            <div className="flex items-center gap-1.5 px-3 py-2">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2 text-[11px] text-neutral-500">aurea · build</span>
            </div>
            <div
              ref={logRef}
              className="h-64 overflow-y-auto px-3 pb-3 font-mono text-[11px] leading-relaxed text-neutral-400"
            >
              {log.map((line, i) => (
                <div
                  key={i}
                  className={cn(line.startsWith("✓") && "text-[var(--success)]")}
                >
                  {line}
                </div>
              ))}
              <span className="inline-block h-3 w-1.5 animate-pulse bg-primary align-middle" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
