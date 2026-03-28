import { db } from "../index.js";
import { deliveryAttempts } from "../schema.js";
import { eq, and } from "drizzle-orm";

export const logDeliveryAttempt = async (
  data: typeof deliveryAttempts.$inferInsert,
) => {
  const [newLog] = await db
    .insert(deliveryAttempts)
    .values({
      ...data,
    })
    .returning();
  return newLog;
};

export const updateDeliveryAttempt = async (
  id: string,
  data: Partial<typeof deliveryAttempts.$inferInsert>,
) => {
  const [updatedLog] = await db
    .update(deliveryAttempts)
    .set(data)
    .where(eq(deliveryAttempts.id, id))
    .returning();
  return updatedLog;
};

export const getSuccessfulSubscribers = async (jobId: string) => {
  return await db
    .select({ subscriberId: deliveryAttempts.subscriberId })
    .from(deliveryAttempts)
    .where(
      and(
        eq(deliveryAttempts.jobId, jobId),
        eq(deliveryAttempts.status, "success"),
      ),
    );
};

export const getAttemptsByJobId = async (jobId: string) => {
  return await db
    .select()
    .from(deliveryAttempts)
    .where(eq(deliveryAttempts.jobId, jobId))
    .orderBy(deliveryAttempts.createdAt);
};
