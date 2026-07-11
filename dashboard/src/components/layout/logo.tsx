import { cn } from "@/lib/utils";

/** Aurea brand mark — a layered "spark" glyph rendered in pure SVG. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn("size-7", className)} aria-hidden>
      <defs>
        <linearGradient id="aurea-g" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0" stopColor="oklch(0.78 0.14 285)" />
          <stop offset="1" stopColor="oklch(0.7 0.14 235)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#aurea-g)" opacity="0.16" />
      <rect x="1" y="1" width="30" height="30" rx="9" stroke="url(#aurea-g)" strokeOpacity="0.5" />
      <path
        d="M16 7.5l2.6 5.9 5.9 2.6-5.9 2.6L16 24.5l-2.6-5.9-5.9-2.6 5.9-2.6L16 7.5z"
        fill="url(#aurea-g)"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <div className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight">Aurea</span>
        <span className="text-[10px] uppercase tracking-[0.14em] text-subtle-foreground">
          AI Web Studio
        </span>
      </div>
    </div>
  );
}
