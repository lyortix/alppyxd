import { estimateCost, FLAGSHIP_BY_PROVIDER } from "@/ai/providers";
import type { ProviderId } from "@/ai/types";
import { FEATURE_MAP } from "@/features/catalog";

/**
 * Pricing engine.
 *
 * Deterministic, side-effect-free functions that turn a set of selected
 * feature ids + config into a full commercial breakdown. Kept separate from
 * the UI so it can be unit-tested and reused server-side during generation.
 */

export interface PricingConfig {
  /** EUR -> TRY exchange rate. */
  eurToTl: number;
  /** USD -> EUR exchange rate (AI is billed in USD). */
  usdToEur: number;
  /** Share of build tokens that are input (prompt) vs output (generated code). */
  inputRatio: number;
  /** Primary provider/model used for the headline AI cost + profit. */
  provider: ProviderId;
  model: string;
  /** Extra multiplier applied to base price for premium instructions, rush, etc. */
  complexityMultiplier: number;
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  eurToTl: 46.5,
  usdToEur: 0.92,
  inputRatio: 0.32,
  provider: "anthropic",
  model: "claude-opus-4-8",
  complexityMultiplier: 1,
};

export interface ProviderCost {
  label: string;
  provider: ProviderId;
  model: string;
  usd: number;
  eur: number;
  accent: string;
}

export interface PricingBreakdown {
  featureCount: number;
  devPriceEur: number;
  devPriceTl: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  buildMinutes: number;
  /** Headline AI cost (selected provider) in USD and EUR. */
  aiCostUsd: number;
  aiCostEur: number;
  /** Comparison across the three flagship providers. */
  providerCosts: ProviderCost[];
  agencyProfitEur: number;
  marginPct: number;
}

const PROVIDER_ACCENTS: Record<string, string> = {
  Claude: "oklch(0.7 0.14 40)",
  GPT: "oklch(0.72 0.16 162)",
  Gemini: "oklch(0.72 0.14 235)",
};

export function computePricing(
  selectedIds: string[],
  config: PricingConfig = DEFAULT_PRICING_CONFIG,
): PricingBreakdown {
  const features = selectedIds.map((id) => FEATURE_MAP[id]).filter(Boolean);

  const basePriceEur = features.reduce((sum, f) => sum + f.priceEur, 0);
  const devPriceEur = Math.round(basePriceEur * config.complexityMultiplier);
  const devPriceTl = Math.round(devPriceEur * config.eurToTl);

  const totalTokens = features.reduce((sum, f) => sum + f.tokens, 0);
  const inputTokens = Math.round(totalTokens * config.inputRatio);
  const outputTokens = totalTokens - inputTokens;

  const buildMinutes = features.reduce((sum, f) => sum + f.devMinutes, 0);

  // Headline cost against selected provider/model.
  const primary = estimateCost(config.provider, config.model, inputTokens, outputTokens);
  const aiCostUsd = primary.usd;
  const aiCostEur = aiCostUsd * config.usdToEur;

  // Comparison across flagship models.
  const providerCosts: ProviderCost[] = Object.entries(FLAGSHIP_BY_PROVIDER).map(
    ([label, { provider, model }]) => {
      const est = estimateCost(provider, model, inputTokens, outputTokens);
      return {
        label,
        provider,
        model,
        usd: est.usd,
        eur: est.usd * config.usdToEur,
        accent: PROVIDER_ACCENTS[label] ?? "oklch(0.7 0.14 285)",
      };
    },
  );

  const agencyProfitEur = devPriceEur - aiCostEur;
  const marginPct = devPriceEur > 0 ? (agencyProfitEur / devPriceEur) * 100 : 0;

  return {
    featureCount: features.length,
    devPriceEur,
    devPriceTl,
    totalTokens,
    inputTokens,
    outputTokens,
    buildMinutes,
    aiCostUsd,
    aiCostEur,
    providerCosts,
    agencyProfitEur,
    marginPct,
  };
}
