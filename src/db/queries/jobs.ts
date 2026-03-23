import { db } from "../index.js";
import { jobs } from "../schema.js";

export const createJob = async (
  pipelineId: string,
  payload: Record<string, unknown>,
) => {
  return await db
    .insert(jobs)
    .values({
      pipelineId,
      payload,
      status: "queued",
    })
    .returning();
};
