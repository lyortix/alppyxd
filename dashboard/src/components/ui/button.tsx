import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98] select-none [&_svg]:shrink-0 [&_svg]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[0_1px_0_0_oklch(1_0_0/0.2)_inset,0_8px_24px_-8px_var(--primary)] hover:brightness-110",
        secondary:
          "bg-surface-2 text-foreground border border-border hover:bg-accent hover:border-border-strong",
        outline:
          "border border-border text-foreground hover:bg-surface-2 hover:border-border-strong",
        ghost: "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:brightness-110 shadow-[0_8px_24px_-8px_var(--destructive)]",
        subtle: "bg-primary-muted text-primary hover:bg-primary/20",
      },
      size: {
        sm: "h-8 px-3 text-[13px] rounded-md",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-[15px] rounded-xl",
        icon: "size-10 rounded-lg",
        "icon-sm": "size-8 rounded-md",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
