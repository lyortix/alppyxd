"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWizard, type WizardStepId, WIZARD_STEPS } from "@/stores/wizard-store";
import { BUSINESS_TYPE_MAP } from "@/data/business-types";
import { Icon } from "@/components/ui/misc";
import { Stepper } from "./stepper";
import { StepCreate } from "./step-create";
import { StepAnalysis } from "./step-analysis";
import { StepInstructions } from "./step-instructions";
import { StepFeatures } from "./step-features";
import { StepGenerate } from "./step-generate";

const STEP_TITLES: Record<WizardStepId, { title: string; description: string }> = {
  create: { title: "Yeni Proje Oluştur", description: "İşletmeyi tanımlayın ve üretim için temel bilgileri girin." },
  analysis: { title: "İşletme Analizi", description: "Toplanan verileri inceleyin ve gerekirse düzenleyin." },
  instructions: { title: "Özel Talimatlar", description: "AI'ya tasarım ve içerik yönergelerinizi verin." },
  features: { title: "Özellik Oluşturucu", description: "Web sitesinde olmasını istediğiniz her şeyi seçin." },
  generate: { title: "Proje Üretimi", description: "Üretim hattı çalışıyor — birazdan hazır." },
};

export function Wizard({ initialType }: { initialType?: string }) {
  const { step, setStep, businessType, projectName, setGenerationStatus } = useWizard();
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === step);
  const type = BUSINESS_TYPE_MAP[businessType];

  const startGeneration = React.useCallback(() => {
    setGenerationStatus("idle");
    setStep("generate");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setGenerationStatus, setStep]);

  const meta = STEP_TITLES[step];

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 lg:px-8 lg:py-8">
      {/* Header row */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{meta.title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{meta.description}</p>
        </div>
        <div className="overflow-x-auto pb-1">
          <Stepper
            current={step}
            maxReached={currentIndex}
            onStepClick={(id) => setStep(id)}
          />
        </div>
      </div>

      {/* Context bar */}
      {projectName && step !== "create" && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-surface/40 px-4 py-2.5">
          {type && (
            <span className="grid size-8 place-items-center rounded-lg bg-primary-muted">
              <Icon name={type.icon} className="size-4 text-primary" />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{projectName}</p>
            <p className="text-[11px] text-muted-foreground">{type?.label ?? "İşletme"}</p>
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="rounded-2xl border border-border bg-card/40 p-5 sm:p-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === "create" && <StepCreate initialType={initialType} />}
            {step === "analysis" && <StepAnalysis />}
            {step === "instructions" && <StepInstructions />}
            {step === "features" && <StepFeatures onGenerate={startGeneration} />}
            {step === "generate" && <StepGenerate />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
