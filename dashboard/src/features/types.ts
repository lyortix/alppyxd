/**
 * Feature catalog model.
 *
 * The Feature Builder (Step 4) renders entirely from this data. Adding a new
 * sellable feature is a matter of appending an object to the catalog — the UI,
 * pricing engine and generation pipeline pick it up automatically. This is how
 * we scale to 100+ features without touching components.
 */

export type FeatureTier = "essential" | "growth" | "premium";

export interface Feature {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  /** Base agency price in EUR. TL is derived from the live-ish exchange rate. */
  priceEur: number;
  /** Estimated hands-on development time in minutes. */
  devMinutes: number;
  /** Estimated total AI tokens to build this feature (input + output). */
  tokens: number;
  tier: FeatureTier;
  /** Marks features we recommend by default for most businesses. */
  popular?: boolean;
  /** Turned on automatically when a new project is created. */
  defaultOn?: boolean;
  /** Feature ids that must be enabled for this one to work. */
  dependsOn?: string[];
  /** Business types this feature is especially relevant for (empty = all). */
  bestFor?: string[];
}

export interface FeatureCategory {
  id: string;
  name: string;
  description: string;
  /** Lucide icon name, resolved in the UI layer. */
  icon: string;
  accent: string;
}
