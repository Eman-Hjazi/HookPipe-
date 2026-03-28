import { z } from "zod";

const TransformConfig = z.object({
  mapping: z.record(z.string(), z.string()).describe("Required for transform"),
});

const FilterConfig = z.object({
  field: z.string(),
  operator: z.enum(["equals", "contains", "greater_than", "less_than"]),
  value: z.any(),
});

const EnrichConfig = z.object({
  extraData: z.record(z.string(), z.any()),
});

const ActionSchema = z.discriminatedUnion("actionType", [
  z.object({
    actionType: z.literal("transform"),
    actionConfig: TransformConfig,
  }),
  z.object({ actionType: z.literal("filter"), actionConfig: FilterConfig }),
  z.object({ actionType: z.literal("enrich"), actionConfig: EnrichConfig }),
]);

const createPipelineBody = z
  .object({
    name: z.string().min(3, "Name is too short (min 3 chars)").max(50),
    action: ActionSchema,
    subscriberUrls: z
      .array(z.string().url("Invalid URL format"))
      .min(1, "At least one subscriber URL is required"),
  })
  .strict();

export const createPipelineSchema = z.object({
  body: createPipelineBody,
});

export type CreatePipelineInput = z.infer<typeof createPipelineBody>;

export const updatePipelineSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Pipeline ID format"),
  }),
  body: createPipelineBody
    .partial()
    .extend({
      isActive: z.boolean().optional(),
    })
    .strict(),
});

export const getPipelineSchema = z.object({
  params: z.object({
    sourcePath: z.string().length(12, "Path must be exactly 12 chars"),
  }),
});

export const deletePipelineSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type UpdatePipelineInput = z.infer<typeof updatePipelineSchema>["body"];
