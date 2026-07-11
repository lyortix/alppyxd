"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { MapPin, Info } from "lucide-react";
import { createProjectSchema, type CreateProjectInput } from "@/schemas/project";
import { BUSINESS_TYPES } from "@/data/business-types";
import { useWizard } from "@/stores/wizard-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/misc";
import { WizardFooter } from "./wizard-footer";
import { cn } from "@/lib/utils";

export function StepCreate({ initialType }: { initialType?: string }) {
  const { projectName, businessType, googleMapsUrl, noMapsUrl, setProjectBasics, goNext } =
    useWizard();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      projectName: projectName || "",
      businessType: businessType || initialType || "",
      googleMapsUrl: googleMapsUrl || "",
      noMapsUrl: noMapsUrl || false,
    },
  });

  const selectedType = watch("businessType");
  const noMaps = watch("noMapsUrl");

  const onSubmit = (data: CreateProjectInput) => {
    setProjectBasics({
      projectName: data.projectName,
      businessType: data.businessType,
      googleMapsUrl: data.noMapsUrl ? "" : data.googleMapsUrl ?? "",
      noMapsUrl: data.noMapsUrl,
    });
    goNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-8">
        {/* Project name */}
        <div className="space-y-2">
          <Label htmlFor="projectName">
            Proje Adı <span className="text-primary">*</span>
          </Label>
          <Input
            id="projectName"
            placeholder="Örn. Marina Balık Restaurant"
            autoFocus
            {...register("projectName")}
          />
          {errors.projectName && (
            <p className="text-xs text-destructive">{errors.projectName.message}</p>
          )}
        </div>

        {/* Business type */}
        <div className="space-y-3">
          <Label>İşletme Türü</Label>
          <input type="hidden" {...register("businessType")} />
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {BUSINESS_TYPES.map((b) => {
              const active = selectedType === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() =>
                    setValue("businessType", b.id, { shouldValidate: true })
                  }
                  className={cn(
                    "group relative flex flex-col items-center gap-2.5 rounded-xl border p-4 transition-all",
                    active
                      ? "border-primary bg-primary-muted"
                      : "border-border bg-surface/50 hover:border-border-strong hover:bg-surface-2",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="type-active"
                      className="absolute inset-0 rounded-xl ring-1 ring-primary/50"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon
                    name={b.icon}
                    className={cn(
                      "size-6 transition-colors",
                      active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  <span className="text-[13px] font-medium">{b.label}</span>
                </button>
              );
            })}
          </div>
          {errors.businessType && (
            <p className="text-xs text-destructive">{errors.businessType.message}</p>
          )}
        </div>

        {/* Google Maps */}
        <div className="space-y-3">
          <Label htmlFor="googleMapsUrl">Google Maps Bağlantısı</Label>
          {!noMaps && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="relative"
            >
              <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground" />
              <Input
                id="googleMapsUrl"
                placeholder="https://maps.google.com/..."
                className="pl-9"
                {...register("googleMapsUrl")}
              />
            </motion.div>
          )}
          {errors.googleMapsUrl && (
            <p className="text-xs text-destructive">{errors.googleMapsUrl.message}</p>
          )}

          <label className="flex cursor-pointer items-center gap-2.5 pt-1">
            <Checkbox
              checked={noMaps}
              onCheckedChange={(v) =>
                setValue("noMapsUrl", v, { shouldValidate: true })
              }
            />
            <span className="text-sm text-muted-foreground">
              Google Maps bağlantım yok
            </span>
          </label>

          <div className="flex items-start gap-2.5 rounded-lg border border-border bg-surface/40 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-sky" />
            <p>
              Maps bağlantısı verirseniz işletme adı, telefon, adres, çalışma
              saatleri, yorumlar ve renk paletini otomatik analiz ederiz. Yoksa
              bir sonraki adımda manuel girebilirsiniz.
            </p>
          </div>
        </div>
      </div>

      <WizardFooter hideBack nextLabel="Analize Geç" onNext={handleSubmit(onSubmit)} />
    </form>
  );
}
