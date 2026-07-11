"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Sparkline } from "./sparkline";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  data,
  color,
  index = 0,
}: {
  label: string;
  value: string;
  delta?: number;
  data: number[];
  color?: string;
  index?: number;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 card-hairline"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
        </div>
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
              positive
                ? "bg-[oklch(0.72_0.16_162/0.14)] text-[var(--success)]"
                : "bg-[oklch(0.63_0.22_22/0.14)] text-[var(--destructive)]",
            )}
          >
            {positive ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <Sparkline data={data} color={color ?? "var(--primary)"} />
      </div>
    </motion.div>
  );
}
