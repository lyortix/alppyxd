import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-2 text-muted-foreground",
        primary: "border-primary/25 bg-primary-muted text-primary",
        success: "border-transparent bg-[oklch(0.72_0.16_162/0.14)] text-[var(--success)]",
        warning: "border-transparent bg-[oklch(0.8_0.14_78/0.14)] text-[var(--warning)]",
        danger: "border-transparent bg-[oklch(0.63_0.22_22/0.14)] text-[var(--destructive)]",
        outline: "border-border text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
