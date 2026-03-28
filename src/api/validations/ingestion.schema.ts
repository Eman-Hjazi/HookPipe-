import { z } from "zod";
export const ingestionSchema = z.object({
  params: z.object({
    sourcePath: z.string().length(12, "Path must be exactly 12 chars"),
  }),
  body: z
    .record(z.string(), z.any())
    .refine((data) => Object.keys(data).length > 0, {
      message: "Payload cannot be empty",
    })
    .refine((data) => Object.keys(data).length <= 50, {
      message: "Payload too large: Maximum 50 fields allowed",
    }),
});
