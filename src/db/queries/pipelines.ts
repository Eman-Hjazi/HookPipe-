import { db } from "../index.js";
import { pipelines, subscribers } from "../schema.js";
import { nanoid } from "nanoid";
import { eq, and, inArray } from "drizzle-orm";
import {
  CreatePipelineInput,
  UpdatePipelineInput,
} from "../../api/validations/pipeline.schema.js";

import {
  ActionType,
  ActionConfig,
  PipelineWithSubscribers,
} from "../../shared/types.js";

export const createPipeline = async (data: CreatePipelineInput) => {
  return await db.transaction(async (tx) => {
    const [newPipeline] = await tx
      .insert(pipelines)
      .values({
        name: data.name,
        sourcePath: nanoid(12),
        actionType: data.action.actionType as ActionType,
        actionConfig: data.action.actionConfig as ActionConfig,
      })
      .returning();

    const subscriberRecords = data.subscriberUrls.map((url) => ({
      pipelineId: newPipeline.id,
      url: url,
    }));

    const insertedSubscribers = await tx
      .insert(subscribers)
      .values(subscriberRecords)
      .returning();

    return { ...newPipeline, subscribers: insertedSubscribers };
  });
};

export const getAllPipelines = async () => {
  return await db.query.pipelines.findMany({
    with: {
      subscribers: true,
    },
  });
};

export const getPipelineByPath = async (
  sourcePath: string,
  includeSubscribers = false,
): Promise<PipelineWithSubscribers | null> => {
  return (await db.query.pipelines.findFirst({
    where: eq(pipelines.sourcePath, sourcePath),
    with: includeSubscribers ? { subscribers: true } : undefined,
  })) as PipelineWithSubscribers | null;
};

export const updatePipeline = async (id: string, data: UpdatePipelineInput) => {
  return await db.transaction(async (tx) => {
    await tx
      .update(pipelines)
      .set({
        name: data.name,
        ...(data.action && {
          actionType: data.action.actionType as ActionType,
          actionConfig: data.action.actionConfig as ActionConfig,
        }),
        isActive: data.isActive,
        updatedAt: new Date(),
      })
      .where(eq(pipelines.id, id));

    if (data.subscriberUrls) {
      const currentSubscribers = await tx
        .select()
        .from(subscribers)
        .where(eq(subscribers.pipelineId, id));

      const currentUrls = currentSubscribers.map((s) => s.url);

      const urlsToDelete = currentUrls.filter(
        (url) => !data.subscriberUrls!.includes(url),
      );

      const urlsToInsert = data.subscriberUrls.filter(
        (url) => !currentUrls.includes(url),
      );

      if (urlsToDelete.length > 0) {
        await tx
          .delete(subscribers)
          .where(
            and(
              eq(subscribers.pipelineId, id),
              inArray(subscribers.url, urlsToDelete),
            ),
          );
      }

      if (urlsToInsert.length > 0) {
        const newRecords = urlsToInsert.map((url) => ({
          pipelineId: id,
          url: url,
        }));
        await tx.insert(subscribers).values(newRecords);
      }
    }

    return { message: "Pipeline updated successfully using Smart Sync" };
  });
};

export const deletePipeline = async (id: string) => {
  const [deletedPipeline] = await db
    .delete(pipelines)
    .where(eq(pipelines.id, id))
    .returning();

  if (!deletedPipeline) {
    throw new Error("Delete Error: Pipeline not found.");
  }

  return { message: "Pipeline and its subscribers deleted successfully" };
};

export const getPipelineById = async (
  id: string,
  includeSubscribers = true,
): Promise<PipelineWithSubscribers | null> => {
  const result = await db.query.pipelines.findFirst({
    where: eq(pipelines.id, id),
    with: includeSubscribers ? { subscribers: true } : undefined,
  });

  return (result as PipelineWithSubscribers) || null;
};
