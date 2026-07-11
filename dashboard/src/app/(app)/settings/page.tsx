"use client";

import * as React from "react";
import { Palette, Coins, Bell, SlidersHorizontal } from "lucide-react";
import { PageHeader, PageShell } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/misc";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useWizard } from "@/stores/wizard-store";
import { formatPercent } from "@/lib/format";

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SectionCard({
  icon: IconCmp,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="mb-1 flex items-center gap-2">
        <IconCmp className="size-4 text-primary" />
        <h2 className="font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </Card>
  );
}

export default function SettingsPage() {
  const { pricing, setPricingConfig } = useWizard();
  const [notifications, setNotifications] = React.useState({
    email: true,
    generation: true,
    weekly: false,
  });

  return (
    <PageShell className="max-w-3xl">
      <PageHeader
        eyebrow="Çalışma Alanı"
        title="Ayarlar"
        description="Çalışma alanı tercihlerini ve fiyatlandırma varsayılanlarını yönetin."
      />

      <div className="space-y-6">
        <SectionCard icon={Palette} title="Görünüm">
          <SettingRow title="Tema" description="Koyu mod öncelikli arayüz. İstediğinizde değiştirin.">
            <ThemeToggle />
          </SettingRow>
        </SectionCard>

        <SectionCard icon={Coins} title="Fiyatlandırma">
          <SettingRow title="EUR → TL Kuru" description="Fiyatların TL karşılığını hesaplamak için kullanılır.">
            <Input
              type="number"
              step="0.1"
              value={pricing.eurToTl}
              onChange={(e) => setPricingConfig({ eurToTl: Number(e.target.value) || 0 })}
              className="w-28 text-right tabular-nums"
            />
          </SettingRow>
          <SettingRow title="USD → EUR Kuru" description="AI maliyeti USD cinsindendir; EUR'a çevrilir.">
            <Input
              type="number"
              step="0.01"
              value={pricing.usdToEur}
              onChange={(e) => setPricingConfig({ usdToEur: Number(e.target.value) || 0 })}
              className="w-28 text-right tabular-nums"
            />
          </SettingRow>
          <SettingRow
            title={`Girdi / Çıktı Oranı · ${formatPercent(pricing.inputRatio * 100)} girdi`}
            description="Üretimde token'ların ne kadarının girdi (prompt) olduğu."
          >
            <input
              type="range"
              min={0.1}
              max={0.6}
              step={0.02}
              value={pricing.inputRatio}
              onChange={(e) => setPricingConfig({ inputRatio: Number(e.target.value) })}
              className="w-40 accent-[var(--primary)]"
            />
          </SettingRow>
          <SettingRow
            title={`Karmaşıklık Çarpanı · ${pricing.complexityMultiplier.toFixed(2)}×`}
            description="Premium talimatlar veya acil işler için fiyat çarpanı."
          >
            <input
              type="range"
              min={0.8}
              max={1.6}
              step={0.05}
              value={pricing.complexityMultiplier}
              onChange={(e) =>
                setPricingConfig({ complexityMultiplier: Number(e.target.value) })
              }
              className="w-40 accent-[var(--primary)]"
            />
          </SettingRow>
        </SectionCard>

        <SectionCard icon={Bell} title="Bildirimler">
          <SettingRow title="E-posta bildirimleri" description="Önemli olaylarda e-posta al.">
            <Switch
              checked={notifications.email}
              onCheckedChange={(v) => setNotifications((n) => ({ ...n, email: v }))}
            />
          </SettingRow>
          <SettingRow title="Üretim tamamlandığında" description="Bir proje üretimi bittiğinde haber ver.">
            <Switch
              checked={notifications.generation}
              onCheckedChange={(v) => setNotifications((n) => ({ ...n, generation: v }))}
            />
          </SettingRow>
          <SettingRow title="Haftalık özet" description="Haftalık üretim ve gelir raporu.">
            <Switch
              checked={notifications.weekly}
              onCheckedChange={(v) => setNotifications((n) => ({ ...n, weekly: v }))}
            />
          </SettingRow>
        </SectionCard>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface/40 p-4 text-xs text-muted-foreground">
          <SlidersHorizontal className="size-4 shrink-0 text-subtle-foreground" />
          Bu ayarlar mevcut oturum için geçerlidir. Kalıcı çalışma alanı ayarları
          bir sonraki sürümde eklenecek.
        </div>
      </div>
    </PageShell>
  );
}
