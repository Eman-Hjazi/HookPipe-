import { db } from "../index.js";
import { jobs } from "../schema.js";

export const createJob = async (
  pipelineId: string,
  payload: Record<string, unknown>,
) => {
  try {
    const [newJob] = await db
      .insert(jobs)
      .values({
        pipelineId,
        payload,
        status: "queued",
      })
      .returning();

    return newJob;
  } catch (error) {
    console.error("Failed to create job in database:", error);
    throw new Error("Queueing operation failed", { cause: error });
  }
};
