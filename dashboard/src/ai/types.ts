/**
 * Provider-agnostic AI abstraction.
 *
 * Everything the dashboard knows about "an AI provider" lives behind these
 * types so we can add Claude, GPT, Gemini, DeepSeek, OpenRouter, Groq or any
 * custom endpoint without touching the pricing or generation UI.
 */

export type ProviderId =
  | "anthropic"
  | "openai"
  | "google"
  | "deepseek"
  | "openrouter"
  | "groq"
  | "custom";

/** USD price per 1M tokens. */
export interface ModelPricing {
  inputPerMTok: number;
  outputPerMTok: number;
  cachedInputPerMTok?: number;
}

export interface AIModel {
  id: string;
  label: string;
  contextWindow: number;
  pricing: ModelPricing;
  /** Relative quality weight (1 = baseline) used for smart routing hints. */
  quality: number;
  recommendedFor?: string[];
}

export interface AIProvider {
  id: ProviderId;
  name: string;
  /** Short tagline shown in the provider picker. */
  blurb: string;
  /** Environment variable that holds the API key (documented, never stored in UI). */
  apiKeyEnv: string;
  /** API surface — lets the abstraction target Responses API, Messages API, etc. */
  apiStyle: "anthropic-messages" | "openai-chat" | "openai-responses" | "custom";
  models: AIModel[];
  /** Whether the provider is wired up. Future providers ship as `false`. */
  available: boolean;
  accent: string;
}

/** Result of estimating a token spend against a specific model. */
export interface CostEstimate {
  provider: ProviderId;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  usd: number;
}
