"use client";

import * as React from "react";
import * as Icons from "lucide-react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---- Separator --------------------------------------------------- */
export function Separator({
  className,
  orientation = "horizontal",
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <div
      role="separator"
      className={cn(
        "bg-border",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className,
      )}
    />
  );
}

/* ---- Progress ---------------------------------------------------- */
export function Progress({
  value,
  className,
  indicatorClassName,
}: {
  value: number;
  className?: string;
  indicatorClassName?: string;
}) {
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className)}
    >
      <div
        className={cn(
          "h-full rounded-full bg-primary transition-[width] duration-500 ease-out",
          indicatorClassName,
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ---- Dynamic Lucide icon by name --------------------------------- */
type IconName = keyof typeof Icons;

export function Icon({
  name,
  className,
  ...props
}: { name: string; className?: string } & Omit<LucideProps, "ref">) {
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[
    name
  ];
  if (!Cmp) return <Icons.Square className={className} {...props} />;
  return <Cmp className={className} {...props} />;
}

export type { IconName };

/* ---- Kbd --------------------------------------------------------- */
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-surface-2 px-1.5 text-[11px] font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}
