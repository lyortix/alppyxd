"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress, Icon } from "@/components/ui/misc";
import { BUSINESS_TYPE_MAP } from "@/data/business-types";
import { STATUS_META, type ProjectRecord } from "@/data/mock-projects";
import { formatEUR } from "@/lib/format";

export function ProjectCard({ project, index = 0 }: { project: ProjectRecord; index?: number }) {
  const type = BUSINESS_TYPE_MAP[project.businessType];
  const status = STATUS_META[project.status];

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-5 card-hairline transition-all hover:border-border-strong hover:shadow-float"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="grid size-10 shrink-0 place-items-center rounded-lg border border-border"
            style={{ background: `color-mix(in oklch, ${project.accent} 14%, transparent)` }}
          >
            <Icon
              name={type?.icon ?? "Sparkles"}
              className="size-5"
              style={{ color: project.accent }}
            />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-medium tracking-tight">{project.name}</h3>
            <p className="text-xs text-muted-foreground">{type?.label ?? "İşletme"}</p>
          </div>
        </div>
        <ArrowUpRight className="size-4 shrink-0 text-subtle-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="flex items-center justify-between">
        <Badge variant={status.variant}>{status.label}</Badge>
        <span className="text-sm font-semibold tabular-nums">
          {formatEUR(project.priceEur)}
        </span>
      </div>

      {(project.status === "generating" || project.status === "completed") && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Üretim</span>
            <span className="tabular-nums">{project.progress}%</span>
          </div>
          <Progress
            value={project.progress}
            indicatorClassName={project.status === "completed" ? "bg-[var(--success)]" : undefined}
          />
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span>{project.featureCount} özellik</span>
        <span>{project.updatedAt}</span>
      </div>
    </motion.article>
  );
}
