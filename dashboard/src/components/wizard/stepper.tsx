"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { WIZARD_STEPS, type WizardStepId } from "@/stores/wizard-store";
import { cn } from "@/lib/utils";

export function Stepper({
  current,
  onStepClick,
  maxReached,
}: {
  current: WizardStepId;
  onStepClick?: (id: WizardStepId) => void;
  maxReached: number;
}) {
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === current);

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {WIZARD_STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const reachable = i <= maxReached;
        return (
          <div key={step.id} className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => reachable && onStepClick?.(step.id)}
              className={cn(
                "group flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3 transition-colors",
                active && "bg-surface-2 border border-border",
                reachable && !active && "hover:bg-surface-2",
                !reachable && "cursor-not-allowed opacity-50",
              )}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold transition-colors",
                  done && "bg-primary text-primary-foreground",
                  active && "bg-primary text-primary-foreground",
                  !done && !active && "border border-border-strong text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-[13px] font-medium sm:inline",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </button>
            {i < WIZARD_STEPS.length - 1 && (
              <div className="relative h-px w-4 overflow-hidden bg-border sm:w-8">
                <motion.div
                  className="absolute inset-0 bg-primary"
                  initial={false}
                  animate={{ scaleX: done ? 1 : 0 }}
                  style={{ originX: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
