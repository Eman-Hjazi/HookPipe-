import { db } from "../index.js";
import { pipelines, subscribers } from "../schema.js";
import { nanoid } from "nanoid";
import { eq, and, inArray } from "drizzle-orm";
import {
  CreatePipelineInput,
  UpdatePipelineInput,
} from "../../api/validations/pipeline.schema.js";

/**
 * Creates a new pipeline with its subscribers.
 * Requirement: A pipeline must connect a source, an action, and one or more subscribers.
 */
// src/db/queries/pipelines.ts

export const createPipeline = async (data: CreatePipelineInput) => {
  return await db.transaction(async (tx) => {
    const [newPipeline] = await tx
      .insert(pipelines)
      .values({
        name: data.name,
        sourcePath: nanoid(12),
        actionType: data.actionType,
        actionConfig: data.actionConfig ?? {},
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

/**
 * Retrieves all pipelines including their subscribers.
 * Supports the CRUD API requirement.
 */
export const getAllPipelines = async () => {
  return await db.query.pipelines.findMany({
    with: {
      subscribers: true,
    },
  });
};

/**
 * Finds a specific pipeline by its unique source path.
 * Used for "Webhook Ingestion".
 */
export const getPipelineByPath = async (
  sourcePath: string,
  includeSubscribers = false,
) => {
  return await db.query.pipelines.findFirst({
    where: eq(pipelines.sourcePath, sourcePath),
    with: includeSubscribers ? { subscribers: true } : undefined,
  });
};

/**
 * Updates an existing pipeline and its subscribers.
 * Includes edge-case handling for empty subscriber lists.
 */
export const updatePipeline = async (id: string, data: UpdatePipelineInput) => {
  return await db.transaction(async (tx) => {
    await tx
      .update(pipelines)
      .set({
        name: data.name,
        actionType: data.actionType,
        actionConfig: data.actionConfig,
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

/**
 * Deletes a pipeline and its associated subscribers.
 * Uses .returning() to verify if a record was actually deleted.
 */
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
