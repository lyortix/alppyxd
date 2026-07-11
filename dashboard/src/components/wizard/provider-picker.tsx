"use client";

import * as React from "react";
import { Check, ChevronDown, Cpu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PROVIDERS } from "@/ai/providers";
import { useWizard } from "@/stores/wizard-store";
import { cn } from "@/lib/utils";

export function ProviderPicker() {
  const { pricing, setProvider } = useWizard();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const provider = PROVIDERS.find((p) => p.id === pricing.provider);
  const model = provider?.models.find((m) => m.id === pricing.model);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-surface/60 px-3 py-2 text-left transition-colors hover:border-border-strong"
      >
        <span
          className="grid size-7 shrink-0 place-items-center rounded-md"
          style={{ background: `color-mix(in oklch, ${provider?.accent} 18%, transparent)` }}
        >
          <Cpu className="size-3.5" style={{ color: provider?.accent }} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{model?.label}</span>
          <span className="block truncate text-[11px] text-muted-foreground">{provider?.name}</span>
        </span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-40 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-border bg-popover p-2 shadow-float"
          >
            {PROVIDERS.map((p) => (
              <div key={p.id} className="mb-1.5 last:mb-0">
                <div className="flex items-center gap-2 px-2 py-1">
                  <span className="size-1.5 rounded-full" style={{ background: p.accent }} />
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-subtle-foreground">
                    {p.name}
                  </span>
                  {!p.available && (
                    <span className="text-[10px] text-subtle-foreground">· yakında</span>
                  )}
                </div>
                {p.models.map((m) => {
                  const active = pricing.provider === p.id && pricing.model === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={!p.available}
                      onClick={() => {
                        setProvider(p.id, m.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                        active ? "bg-primary-muted text-primary" : "hover:bg-surface-2",
                        !p.available && "opacity-40",
                      )}
                    >
                      <span className="flex-1 truncate">{m.label}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        ${m.pricing.inputPerMTok}/${m.pricing.outputPerMTok}
                      </span>
                      {active && <Check className="size-3.5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
