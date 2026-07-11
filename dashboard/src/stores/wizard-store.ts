"use client";

import { create } from "zustand";
import type { BusinessAnalysis } from "@/data/mock-analysis";
import {
  defaultSelectedFeatureIds,
  dependentsOf,
  resolveDependencies,
} from "@/features/catalog";
import type { ProviderId } from "@/ai/types";
import { DEFAULT_PRICING_CONFIG, type PricingConfig } from "@/lib/pricing";

export type WizardStepId =
  | "create"
  | "analysis"
  | "instructions"
  | "features"
  | "generate";

export const WIZARD_STEPS: { id: WizardStepId; label: string }[] = [
  { id: "create", label: "Proje" },
  { id: "analysis", label: "Analiz" },
  { id: "instructions", label: "Talimatlar" },
  { id: "features", label: "Özellikler" },
  { id: "generate", label: "Üretim" },
];

export type AnalysisStatus = "idle" | "loading" | "ready";
export type GenerationStatus = "idle" | "running" | "done";

interface WizardState {
  step: WizardStepId;

  // Step 1
  projectName: string;
  businessType: string;
  googleMapsUrl: string;
  noMapsUrl: boolean;

  // Step 2
  analysisStatus: AnalysisStatus;
  analysis: BusinessAnalysis | null;

  // Step 3
  customInstructions: string;

  // Step 4
  selectedFeatureIds: string[];

  // Step 5 config
  pricing: PricingConfig;

  // Step 6
  generationStatus: GenerationStatus;

  // ---- actions ----
  setStep: (step: WizardStepId) => void;
  goNext: () => void;
  goBack: () => void;
  setProjectBasics: (input: {
    projectName: string;
    businessType: string;
    googleMapsUrl: string;
    noMapsUrl: boolean;
  }) => void;
  setAnalysisStatus: (status: AnalysisStatus) => void;
  setAnalysis: (analysis: BusinessAnalysis | null) => void;
  updateAnalysis: (patch: Partial<BusinessAnalysis>) => void;
  setCustomInstructions: (value: string) => void;
  toggleFeature: (id: string) => void;
  setFeatures: (ids: string[]) => void;
  addFeatures: (ids: string[]) => void;
  setProvider: (provider: ProviderId, model: string) => void;
  setPricingConfig: (patch: Partial<PricingConfig>) => void;
  setGenerationStatus: (status: GenerationStatus) => void;
  reset: () => void;
}

const STEP_ORDER: WizardStepId[] = [
  "create",
  "analysis",
  "instructions",
  "features",
  "generate",
];

const initialState = {
  step: "create" as WizardStepId,
  projectName: "",
  businessType: "",
  googleMapsUrl: "",
  noMapsUrl: false,
  analysisStatus: "idle" as AnalysisStatus,
  analysis: null as BusinessAnalysis | null,
  customInstructions: "",
  selectedFeatureIds: defaultSelectedFeatureIds(),
  pricing: DEFAULT_PRICING_CONFIG,
  generationStatus: "idle" as GenerationStatus,
};

export const useWizard = create<WizardState>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  goNext: () => {
    const idx = STEP_ORDER.indexOf(get().step);
    if (idx < STEP_ORDER.length - 1) set({ step: STEP_ORDER[idx + 1] });
  },
  goBack: () => {
    const idx = STEP_ORDER.indexOf(get().step);
    if (idx > 0) set({ step: STEP_ORDER[idx - 1] });
  },

  setProjectBasics: (input) => set({ ...input }),

  setAnalysisStatus: (analysisStatus) => set({ analysisStatus }),
  setAnalysis: (analysis) => set({ analysis }),
  updateAnalysis: (patch) =>
    set((s) => (s.analysis ? { analysis: { ...s.analysis, ...patch } } : {})),

  setCustomInstructions: (customInstructions) => set({ customInstructions }),

  toggleFeature: (id) =>
    set((s) => {
      const has = s.selectedFeatureIds.includes(id);
      if (has) {
        // Removing: also remove features that depend on this one.
        const toRemove = new Set([id, ...dependentsOf(id).map((f) => f.id)]);
        return {
          selectedFeatureIds: s.selectedFeatureIds.filter((x) => !toRemove.has(x)),
        };
      }
      // Adding: pull in dependencies.
      return {
        selectedFeatureIds: resolveDependencies([...s.selectedFeatureIds, id]),
      };
    }),
  setFeatures: (ids) => set({ selectedFeatureIds: resolveDependencies(ids) }),
  addFeatures: (ids) =>
    set((s) => ({
      selectedFeatureIds: resolveDependencies([
        ...new Set([...s.selectedFeatureIds, ...ids]),
      ]),
    })),

  setProvider: (provider, model) =>
    set((s) => ({ pricing: { ...s.pricing, provider, model } })),
  setPricingConfig: (patch) =>
    set((s) => ({ pricing: { ...s.pricing, ...patch } })),

  setGenerationStatus: (generationStatus) => set({ generationStatus }),

  reset: () => set({ ...initialState, selectedFeatureIds: defaultSelectedFeatureIds() }),
}));
