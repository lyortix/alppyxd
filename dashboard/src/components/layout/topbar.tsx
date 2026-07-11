"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Search,
  LayoutGrid,
  FolderKanban,
  Plus,
  Boxes,
  Cpu,
  Settings,
} from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Kbd } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

const MOBILE_NAV = [
  { href: "/", label: "Genel Bakış", icon: LayoutGrid },
  { href: "/projects", label: "Projeler", icon: FolderKanban },
  { href: "/projects/new", label: "Yeni Proje", icon: Plus },
  { href: "/catalog", label: "Özellik Kataloğu", icon: Boxes },
  { href: "/providers", label: "AI Sağlayıcılar", icon: Cpu },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

export function Topbar() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-15 items-center gap-3 border-b border-border bg-background/70 px-4 py-3 backdrop-blur-xl lg:px-8">
      <button
        type="button"
        aria-label="Menü"
        onClick={() => setOpen(true)}
        className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground lg:hidden"
      >
        <Menu className="size-4" />
      </button>

      <div className="lg:hidden">
        <Logo />
      </div>

      <div className="hidden flex-1 lg:flex">
        <button
          type="button"
          className="group flex h-9 w-full max-w-sm items-center gap-2.5 rounded-lg border border-border bg-surface/60 px-3 text-sm text-subtle-foreground transition-colors hover:border-border-strong"
        >
          <Search className="size-4" />
          <span>Proje, işletme veya özellik ara…</span>
          <span className="ml-auto flex items-center gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface/60 py-1 pl-1 pr-3">
          <div className="grid size-7 place-items-center rounded-md bg-gradient-to-br from-[oklch(0.7_0.16_285)] to-[oklch(0.68_0.14_235)] text-xs font-semibold text-white">
            AJ
          </div>
          <div className="hidden text-left leading-tight sm:block">
            <p className="text-xs font-medium">Ajans Ekibi</p>
            <p className="text-[10px] text-subtle-foreground">Yönetici</p>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col gap-1 border-r border-border bg-surface p-4 lg:hidden"
            >
              <div className="flex items-center justify-between pb-4">
                <Logo />
                <button
                  type="button"
                  aria-label="Kapat"
                  onClick={() => setOpen(false)}
                  className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
              {MOBILE_NAV.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-surface-2 text-foreground"
                        : "text-muted-foreground hover:bg-surface-2",
                    )}
                  >
                    <item.icon className="size-[18px]" />
                    {item.label}
                  </Link>
                );
              })}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
