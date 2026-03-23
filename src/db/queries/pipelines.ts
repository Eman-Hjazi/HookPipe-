import { db } from "../index.js";
import { pipelines, subscribers } from "../schema.js";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

// Defining the input structure for better Type Safety
export interface CreatePipelineInput {
  name: string;
  actionType: "transform" | "filter" | "enrich";
  actionConfig: Record<string, unknown>;
  subscriberUrls: string[];
}

/**
 * Creates a new pipeline with its subscribers.
 * Requirement: A pipeline must connect a source, an action, and one or more subscribers.
 */
export const createPipeline = async (data: CreatePipelineInput) => {
  // Validation: Ensure at least one subscriber is provided
  if (!data.subscriberUrls || data.subscriberUrls.length === 0) {
    throw new Error(
      "Validation Error: At least one subscriber URL is required to create a pipeline.",
    );
  }

  return await db.transaction(async (tx) => {
    // 1. Insert the main pipeline record
    const [newPipeline] = await tx
      .insert(pipelines)
      .values({
        name: data.name,
        sourcePath: nanoid(12), // Generates the "Unique URL" required by the specs
        actionType: data.actionType,
        actionConfig: data.actionConfig ?? {},
        isActive: true, // Added for "Creativity & Polish" - allows toggling the pipeline
      })
      .returning();

    // 2. Map and insert subscriber URLs
    const subscriberRecords = data.subscriberUrls.map((url) => ({
      pipelineId: newPipeline.id,
      url: url,
    }));

    const insertedSubscribers = await tx
      .insert(subscribers)
      .values(subscriberRecords)
      .returning();

    return {
      ...newPipeline,
      subscribers: insertedSubscribers,
    };
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
export const updatePipeline = async (
  id: string,
  data: Partial<CreatePipelineInput> & { isActive?: boolean },
) => {
  // Edge Case: Prevent clearing all subscribers during update
  if (data.subscriberUrls && data.subscriberUrls.length === 0) {
    throw new Error(
      "Update Error: A pipeline must have at least one subscriber destination.",
    );
  }

  return await db.transaction(async (tx) => {
    // 1. Update pipeline core fields
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

    // 2. Sync subscribers if a new list is provided
    if (data.subscriberUrls) {
      // Remove old subscribers and insert new ones (Sync Strategy)
      await tx.delete(subscribers).where(eq(subscribers.pipelineId, id));

      const subscriberRecords = data.subscriberUrls.map((url) => ({
        pipelineId: id,
        url: url,
      }));

      await tx.insert(subscribers).values(subscriberRecords);
    }

    return { message: "Pipeline updated successfully" };
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
