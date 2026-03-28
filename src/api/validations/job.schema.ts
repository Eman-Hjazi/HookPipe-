import { z } from "zod";

export const getJobSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Job ID format"),
  }),
});
