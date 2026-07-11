"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WizardFooter({
  onBack,
  onNext,
  nextLabel = "Devam Et",
  nextDisabled,
  backDisabled,
  hideBack,
  children,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backDisabled?: boolean;
  hideBack?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
      {!hideBack ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={backDisabled}
        >
          <ArrowLeft className="size-4" /> Geri
        </Button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-3">
        {children}
        {onNext && (
          <Button type="button" onClick={onNext} disabled={nextDisabled}>
            {nextLabel} <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
