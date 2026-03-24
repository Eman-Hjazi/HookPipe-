import "dotenv/config";
import { Worker } from "bullmq";
import { redisConnection } from "../shared/queue.js";

console.log("🚀 Worker is starting and waiting for jobs...");

const worker = new Worker(
  "webhook-queue",
  async (job) => {
    // --- 1. Log job details for debugging ---
    const { jobId, pipelineId } = job.data;

    console.log(
      `[Worker] Processing Job ID: ${jobId} for Pipeline: ${pipelineId}`,
    );

    try {
      // 1. Process the payload based on pipeline configuration (Transform/Filter)
      // 2. Update job status in the database
      // 3. Deliver the results to all configured subscribers via HTTP

      console.log(`[Worker] Successfully processed job ${jobId}`);
    } catch (error) {
      console.error(`[Worker] Failed to process job ${jobId}:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
  },
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed!`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed with error: ${err.message}`);
});
