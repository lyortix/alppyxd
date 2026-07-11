"use client";

import * as React from "react";
import { Sparkles, Plus, Wand2 } from "lucide-react";
import { useWizard } from "@/stores/wizard-store";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WizardFooter } from "./wizard-footer";
import { cn } from "@/lib/utils";

const PRESET_GROUPS: { label: string; items: string[] }[] = [
  {
    label: "Stil",
    items: ["Lüks tasarım", "Minimal", "Apple tarzı", "Modern", "Premium tipografi", "Cesur & büyük"],
  },
  {
    label: "Renk & Tema",
    items: ["Rolex yeşili tonları", "Koyu mod öncelikli", "Altın vurgular", "Toprak tonları", "Monokrom"],
  },
  {
    label: "Hareket",
    items: ["Akıcı animasyonlar", "Yumuşak geçişler", "Scroll efektleri", "Mikro etkileşimler"],
  },
  {
    label: "His",
    items: ["Pahalı hissettirmeli", "Sıcak & samimi", "Güven veren", "Enerjik", "Sakin & huzurlu"],
  },
];

const EXAMPLE = `Lüks bir restoran hissi ver.
Rolex yeşili (#0F5132) ve altın vurgular kullan.
Akıcı animasyonlar, yumuşak scroll geçişleri.
Premium serif tipografi, bol beyaz alan.
Apple tarzı minimal, koyu mod öncelikli.
Menü pahalı ve iştah açıcı görünmeli.`;

export function StepInstructions() {
  const { customInstructions, setCustomInstructions, goNext, goBack } = useWizard();

  const appendPreset = (text: string) => {
    setCustomInstructions(
      customInstructions.trim().length
        ? `${customInstructions.trim()}\n${text}`
        : text,
    );
  };

  const activeSet = new Set(
    customInstructions.split("\n").map((l) => l.trim()),
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="instructions" className="flex items-center gap-1.5">
              <Wand2 className="size-4 text-primary" /> Özel Talimatlar
            </Label>
            <span className="text-xs tabular-nums text-subtle-foreground">
              {customInstructions.length} karakter
            </span>
          </div>
          <Textarea
            id="instructions"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder={`İstediğiniz her şeyi yazın. Örnek:\n\n${EXAMPLE}`}
            className="min-h-64 font-[450] leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Bu metin, üretim aşamasında tüm AI promptlarına aynen enjekte edilecek.
            </p>
            {!customInstructions && (
              <button
                type="button"
                onClick={() => setCustomInstructions(EXAMPLE)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Örneği kullan
              </button>
            )}
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="size-4 text-primary" /> Hızlı Ekle
          </div>
          {PRESET_GROUPS.map((group) => (
            <div key={group.label} className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle-foreground">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map((item) => {
                  const active = activeSet.has(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => !active && appendPreset(item)}
                      disabled={active}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                        active
                          ? "border-primary/30 bg-primary-muted text-primary opacity-60"
                          : "border-border bg-surface/50 text-muted-foreground hover:border-primary/40 hover:bg-primary-muted hover:text-primary",
                      )}
                    >
                      {!active && <Plus className="size-3" />}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <WizardFooter onBack={goBack} onNext={goNext} nextLabel="Özelliklere Geç" />
    </div>
  );
}
