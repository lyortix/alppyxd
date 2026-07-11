import { z } from "zod";
import { BUSINESS_TYPES } from "@/data/business-types";

const businessTypeIds = BUSINESS_TYPES.map((b) => b.id) as [string, ...string[]];

export const createProjectSchema = z
  .object({
    projectName: z
      .string()
      .min(2, "Proje adı en az 2 karakter olmalı")
      .max(60, "Proje adı çok uzun"),
    businessType: z.enum(businessTypeIds, {
      errorMap: () => ({ message: "Lütfen bir işletme türü seçin" }),
    }),
    noMapsUrl: z.boolean().default(false),
    googleMapsUrl: z
      .string()
      .url("Geçerli bir URL girin")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) =>
      data.noMapsUrl ||
      (data.googleMapsUrl && data.googleMapsUrl.trim().length > 0),
    {
      message: "Google Maps bağlantısı girin veya kutucuğu işaretleyin",
      path: ["googleMapsUrl"],
    },
  );

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
