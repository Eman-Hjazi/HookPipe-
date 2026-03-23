import { z } from "zod";

const pipelineIdParam = z.object({
  id: z.string().uuid("Invalid Pipeline ID format (UUID expected)"),
});

const sourcePathParam = z.object({
  sourcePath: z.string().min(12).max(12),
});

const createPipelineBody = z.object({
  name: z.string().min(3, "Name is too short"),
  actionType: z.enum(["transform", "filter", "enrich"]),
  actionConfig: z.record(z.string(), z.any()).optional().default({}),
  subscriberUrls: z
    .array(z.string().url("Invalid URL format"))
    .min(1, "At least one subscriber URL is required"),
});

export const createPipelineSchema = z.object({ body: createPipelineBody });

export const updatePipelineSchema = z.object({
  params: pipelineIdParam,
  body: createPipelineBody
    .partial()
    .extend({ isActive: z.boolean().optional() })
    .strict(),
});

export const getPipelineSchema = z.object({ params: sourcePathParam });
export const deletePipelineSchema = z.object({ params: pipelineIdParam });

export type CreatePipelineInput = z.infer<typeof createPipelineBody>;
export type UpdatePipelineInput = z.infer<typeof updatePipelineSchema>["body"];
