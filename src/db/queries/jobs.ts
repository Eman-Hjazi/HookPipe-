import { db } from "../index.js";
import { jobs } from "../schema.js";
import { eq, sql } from "drizzle-orm";
import { JsonPayload, JobStatus } from "../../shared/types.js";

export const createJob = async (pipelineId: string, payload: JsonPayload) => {
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

export const updateJobStatus = async (id: string, status: JobStatus) => {
  return await db
    .update(jobs)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, id));
};

export const updateJob = async (
  id: string,
  data: Partial<typeof jobs.$inferInsert>,
) => {
  return await db
    .update(jobs)
    .set({
      ...data,
      updatedAt: new Date(),
      ...(data.status === "completed" && { completedAt: new Date() }),
    })
    .where(eq(jobs.id, id))
    .returning();
};

export const getJobById = async (id: string) => {
  const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);

  return job || null;
};


export const incrementRetryCount = async (id: string) => {
  return await db
    .update(jobs)
    .set({
      retryCount: sql`${jobs.retryCount} + 1`,
      status: "retrying",
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, id))
    .returning();
};
