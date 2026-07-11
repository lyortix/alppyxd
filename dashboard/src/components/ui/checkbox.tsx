"use client";

import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked, indeterminate, onCheckedChange, disabled, className, id, ...rest }, ref) => (
    <button
      ref={ref}
      id={id}
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "peer relative grid size-[18px] shrink-0 place-items-center rounded-[6px] border transition-all duration-150 outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        checked || indeterminate
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border-strong bg-surface hover:border-primary/60",
        disabled && "opacity-40 pointer-events-none",
        className,
      )}
      {...rest}
    >
      {indeterminate ? (
        <Minus className="size-3" strokeWidth={3} />
      ) : (
        <Check
          className={cn(
            "size-3 transition-all duration-150",
            checked ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
          strokeWidth={3.5}
        />
      )}
    </button>
  ),
);
Checkbox.displayName = "Checkbox";
