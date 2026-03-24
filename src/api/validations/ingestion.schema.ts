// src/api/validations/ingestion.schema.ts
import { z } from "zod";
export const ingestionSchema = z.object({
  params: z.object({
    sourcePath: z
      .string()
      .min(12, "Path must be 12 chars")
      .max(12, "Path must be 12 chars"),
  }),
  body: z
    .record(z.string(), z.any())
    .refine((data) => Object.keys(data).length > 0, {
      message: "Payload cannot be empty. Please provide data to process.",
    }),
});
