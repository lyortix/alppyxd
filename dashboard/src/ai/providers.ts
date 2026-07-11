import type { AIModel, AIProvider, CostEstimate, ProviderId } from "./types";

/**
 * Provider registry. Prices are USD per 1M tokens and reflect published list
 * pricing at time of writing — they live in one place so finance can tune them
 * without hunting through the codebase.
 */
export const PROVIDERS: AIProvider[] = [
  {
    id: "anthropic",
    name: "Claude",
    blurb: "En yüksek kod & tasarım kalitesi",
    apiKeyEnv: "ANTHROPIC_API_KEY",
    apiStyle: "anthropic-messages",
    available: true,
    accent: "oklch(0.7 0.14 40)",
    models: [
      {
        id: "claude-opus-4-8",
        label: "Claude Opus 4.8",
        contextWindow: 200_000,
        quality: 1.0,
        pricing: { inputPerMTok: 15, outputPerMTok: 75, cachedInputPerMTok: 1.5 },
        recommendedFor: ["Mimari", "Karmaşık backend", "Premium UI"],
      },
      {
        id: "claude-sonnet-5",
        label: "Claude Sonnet 5",
        contextWindow: 200_000,
        quality: 0.92,
        pricing: { inputPerMTok: 3, outputPerMTok: 15, cachedInputPerMTok: 0.3 },
        recommendedFor: ["Genel geliştirme", "Dengeli maliyet"],
      },
      {
        id: "claude-haiku-4-5",
        label: "Claude Haiku 4.5",
        contextWindow: 200_000,
        quality: 0.8,
        pricing: { inputPerMTok: 1, outputPerMTok: 5, cachedInputPerMTok: 0.1 },
        recommendedFor: ["İçerik", "Hızlı iterasyon"],
      },
    ],
  },
  {
    id: "openai",
    name: "GPT",
    blurb: "Responses API & geniş ekosistem",
    apiKeyEnv: "OPENAI_API_KEY",
    apiStyle: "openai-responses",
    available: true,
    accent: "oklch(0.72 0.16 162)",
    models: [
      {
        id: "gpt-5.1",
        label: "GPT-5.1",
        contextWindow: 400_000,
        quality: 0.95,
        pricing: { inputPerMTok: 5, outputPerMTok: 20, cachedInputPerMTok: 0.5 },
        recommendedFor: ["Ajanslar", "Araç kullanımı"],
      },
      {
        id: "gpt-5-mini",
        label: "GPT-5 mini",
        contextWindow: 400_000,
        quality: 0.84,
        pricing: { inputPerMTok: 0.6, outputPerMTok: 2.4, cachedInputPerMTok: 0.06 },
        recommendedFor: ["Toplu üretim", "Uygun maliyet"],
      },
    ],
  },
  {
    id: "google",
    name: "Gemini",
    blurb: "Uzun bağlam & multimodal",
    apiKeyEnv: "GEMINI_API_KEY",
    apiStyle: "custom",
    available: true,
    accent: "oklch(0.72 0.14 235)",
    models: [
      {
        id: "gemini-3-pro",
        label: "Gemini 3 Pro",
        contextWindow: 1_000_000,
        quality: 0.9,
        pricing: { inputPerMTok: 2.5, outputPerMTok: 10, cachedInputPerMTok: 0.25 },
        recommendedFor: ["Uzun içerik", "Görsel analiz"],
      },
      {
        id: "gemini-3-flash",
        label: "Gemini 3 Flash",
        contextWindow: 1_000_000,
        quality: 0.78,
        pricing: { inputPerMTok: 0.3, outputPerMTok: 1.2 },
        recommendedFor: ["Çok ucuz", "Hızlı"],
      },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    blurb: "Güçlü / maliyet oranı yüksek",
    apiKeyEnv: "DEEPSEEK_API_KEY",
    apiStyle: "openai-chat",
    available: false,
    accent: "oklch(0.68 0.16 285)",
    models: [
      {
        id: "deepseek-v3",
        label: "DeepSeek V3",
        contextWindow: 128_000,
        quality: 0.82,
        pricing: { inputPerMTok: 0.27, outputPerMTok: 1.1 },
      },
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    blurb: "Tek anahtar, yüzlerce model",
    apiKeyEnv: "OPENROUTER_API_KEY",
    apiStyle: "openai-chat",
    available: false,
    accent: "oklch(0.7 0.14 320)",
    models: [
      {
        id: "openrouter-auto",
        label: "Auto Router",
        contextWindow: 200_000,
        quality: 0.88,
        pricing: { inputPerMTok: 4, outputPerMTok: 16 },
      },
    ],
  },
  {
    id: "groq",
    name: "Groq",
    blurb: "Ultra düşük gecikme",
    apiKeyEnv: "GROQ_API_KEY",
    apiStyle: "openai-chat",
    available: false,
    accent: "oklch(0.72 0.14 40)",
    models: [
      {
        id: "groq-llama-4",
        label: "Llama 4 (Groq)",
        contextWindow: 128_000,
        quality: 0.76,
        pricing: { inputPerMTok: 0.2, outputPerMTok: 0.6 },
      },
    ],
  },
];

export function getProvider(id: ProviderId): AIProvider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export function getModel(providerId: ProviderId, modelId: string): AIModel | undefined {
  return getProvider(providerId)?.models.find((m) => m.id === modelId);
}

/** Default model shown when the app boots. */
export const DEFAULT_MODEL = { provider: "anthropic" as ProviderId, model: "claude-opus-4-8" };

/**
 * Estimate USD cost for a given token split against a model. Output is
 * generally the dominant cost, so callers pass explicit input/output splits.
 */
export function estimateCost(
  providerId: ProviderId,
  modelId: string,
  inputTokens: number,
  outputTokens: number,
): CostEstimate {
  const model = getModel(providerId, modelId);
  const pricing = model?.pricing ?? { inputPerMTok: 0, outputPerMTok: 0 };
  const usd =
    (inputTokens / 1_000_000) * pricing.inputPerMTok +
    (outputTokens / 1_000_000) * pricing.outputPerMTok;
  return { provider: providerId, modelId, inputTokens, outputTokens, usd };
}

/** Representative "flagship" model per provider, used for cost comparisons. */
export const FLAGSHIP_BY_PROVIDER: Record<string, { provider: ProviderId; model: string }> = {
  Claude: { provider: "anthropic", model: "claude-opus-4-8" },
  GPT: { provider: "openai", model: "gpt-5.1" },
  Gemini: { provider: "google", model: "gemini-3-pro" },
};
