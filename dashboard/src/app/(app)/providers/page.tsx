import { Cpu, KeyRound, Check } from "lucide-react";
import { PageHeader, PageShell } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { PROVIDERS } from "@/ai/providers";

export const metadata = { title: "AI Sağlayıcılar" };

const API_STYLE_LABEL: Record<string, string> = {
  "anthropic-messages": "Anthropic Messages API",
  "openai-chat": "OpenAI Chat Completions",
  "openai-responses": "OpenAI Responses API",
  custom: "Özel API",
};

export default function ProvidersPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Kaynaklar"
        title="AI Sağlayıcılar"
        description="Üretim hattı sağlayıcıdan bağımsızdır. Yeni bir model eklemek için tek yapmanız gereken kaydı tanımlamak."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {PROVIDERS.map((provider) => (
          <div
            key={provider.id}
            className="flex flex-col rounded-2xl border border-border bg-card p-5 card-hairline"
          >
            <div className="flex items-start gap-3">
              <span
                className="grid size-11 shrink-0 place-items-center rounded-xl border border-border"
                style={{ background: `color-mix(in oklch, ${provider.accent} 16%, transparent)` }}
              >
                <Cpu className="size-5" style={{ color: provider.accent }} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold tracking-tight">{provider.name}</h2>
                  <Badge variant={provider.available ? "success" : "default"}>
                    {provider.available ? "Aktif" : "Yakında"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{provider.blurb}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface/50 px-2 py-1">
                {API_STYLE_LABEL[provider.apiStyle]}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface/50 px-2 py-1 font-mono">
                <KeyRound className="size-3" /> {provider.apiKeyEnv}
              </span>
            </div>

            <div className="mt-4 space-y-2 border-t border-border pt-4">
              {provider.models.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <Check className="size-3.5 text-subtle-foreground" />
                  <span className="text-sm font-medium">{m.label}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {(m.contextWindow / 1000).toFixed(0)}K bağlam
                  </span>
                  <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                    ${m.pricing.inputPerMTok} / ${m.pricing.outputPerMTok} · 1M tok
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
