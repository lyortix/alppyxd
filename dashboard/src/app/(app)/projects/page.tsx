"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Search, LayoutGrid } from "lucide-react";
import { PageHeader, PageShell } from "@/components/layout/page-header";
import { ProjectCard } from "@/components/dashboard/project-card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { MOCK_PROJECTS, STATUS_META, type ProjectStatus } from "@/data/mock-projects";
import { cn } from "@/lib/utils";

const FILTERS: { id: ProjectStatus | "all"; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "draft", label: "Taslak" },
  { id: "ready", label: "Hazır" },
  { id: "generating", label: "Üretiliyor" },
  { id: "completed", label: "Tamamlandı" },
];

export default function ProjectsPage() {
  const [filter, setFilter] = React.useState<ProjectStatus | "all">("all");
  const [query, setQuery] = React.useState("");

  const projects = MOCK_PROJECTS.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="Çalışma Alanı"
        title="Projeler"
        description="Ajansınızın tüm web sitesi üretim projeleri tek yerde."
        actions={
          <Link href="/projects/new" className={cn(buttonVariants())}>
            <Plus className="size-4" /> Yeni Proje
          </Link>
        }
      />

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface/50 p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                filter === f.id
                  ? "bg-surface-2 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Proje ara…"
            className="h-9 pl-9"
          />
        </div>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="grid size-12 place-items-center rounded-xl border border-border bg-surface/50">
            <LayoutGrid className="size-6 text-subtle-foreground" />
          </div>
          <p className="mt-4 font-medium">Proje bulunamadı</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Filtreyi değiştirin veya yeni bir proje oluşturun.
          </p>
        </div>
      )}
    </PageShell>
  );
}
