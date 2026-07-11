"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  FolderKanban,
  Plus,
  Boxes,
  Cpu,
  Settings,
  Sparkles,
} from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Çalışma Alanı",
    items: [
      { href: "/", label: "Genel Bakış", icon: LayoutGrid, exact: true },
      { href: "/projects", label: "Projeler", icon: FolderKanban },
      { href: "/projects/new", label: "Yeni Proje", icon: Plus },
    ],
  },
  {
    section: "Kaynaklar",
    items: [
      { href: "/catalog", label: "Özellik Kataloğu", icon: Boxes },
      { href: "/providers", label: "AI Sağlayıcılar", icon: Cpu },
      { href: "/settings", label: "Ayarlar", icon: Settings },
    ],
  },
];

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-border bg-surface/40 px-3 py-4 lg:flex">
      <div className="px-2 pb-4">
        <Link href="/" className="inline-flex">
          <Logo />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto py-2">
        {NAV.map((group) => (
          <div key={group.section} className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">
              {group.section}
            </p>
            {group.items.map((item) => {
              const active = isActive(pathname, item);
              const isNew = item.href === "/projects/new";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-2",
                    isNew && !active && "text-primary hover:text-primary",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-lg bg-surface-2 border border-border"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      "relative size-[18px] shrink-0",
                      active && "text-primary",
                    )}
                  />
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-border bg-surface-2/60 p-3.5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="size-4 text-primary" />
          Aurea Pro
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Dahili ajans sürümü. Sınırsız proje ve AI üretimi.
        </p>
      </div>
    </aside>
  );
}
