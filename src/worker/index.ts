import { Worker, Job } from "bullmq";
import { redisConnection, deliveryQueue } from "../shared/queue.js";
import * as jobQueries from "../db/queries/jobs.js";
import * as pipelineQueries from "../db/queries/pipelines.js";
import { processAction } from "./processors/index.js";
import { deliverToSubscriber } from "./delivery.js";
import * as deliveryQueries from "../db/queries/deliveryAttempts.js";
import {
  Action,
  ActionType,
  ActionConfig,
  JsonPayload,
  DeliveryResult,
  DeliveryStatus,
} from "../shared/types.js";

interface ProcessingJobData {
  jobId: string;
  pipelineId: string;
  payload: JsonPayload;
}

interface DeliveryJobData {
  jobId: string;
  subscriberId: string;
  url: string;
  payload: JsonPayload;
}

const processingWorker = new Worker<ProcessingJobData>(
  "webhook-queue",
  async (job: Job<ProcessingJobData>) => {
    const { jobId, pipelineId, payload } = job.data;

    try {
      await jobQueries.updateJobStatus(jobId, "processing");

      const currentJob = await jobQueries.getJobById(jobId);
      let processedData = currentJob?.processedData as JsonPayload | null;

      const pipeline = await pipelineQueries.getPipelineById(pipelineId, true);
      if (!pipeline || !pipeline.isActive) throw new Error("Pipeline Inactive");

      if (!processedData) {
        processedData = await processAction(
          {
            actionType: pipeline.actionType as ActionType,
            actionConfig: pipeline.actionConfig as ActionConfig,
          } as Action,
          payload,
          jobId,
        );

        if (!processedData) {
          return await jobQueries.updateJob(jobId, {
            status: "skipped",
            errorMessage: "Payload filtered out: Criteria not met.",
          });
        }
        await jobQueries.updateJob(jobId, { processedData });
      }

      const deliveryJobs = pipeline.subscribers.map((sub) => ({
        name: "delivery-task",
        data: {
          jobId,
          subscriberId: sub.id,
          url: sub.url,
          payload: processedData,
        },
      }));

      await deliveryQueue.addBulk(deliveryJobs);

      await jobQueries.updateJob(jobId, { status: "completed" });
    } catch (error: unknown) {
      const err = error as Error;
      const maxAttempts = job.opts.attempts || 5;
      const currentAttempt = (job.attemptsMade || 0) + 1;

      if (currentAttempt < maxAttempts) {
        await jobQueries.incrementRetryCount(jobId);
        console.log(
          `[Worker] 🔄 Job ${jobId} failed, scheduling retry ${currentAttempt + 1}/${maxAttempts}`,
        );
      } else {
        await jobQueries.updateJob(jobId, {
          status: "failed",
          errorMessage: err.message,
        });
        console.error(
          `[Worker] ❌ Job ${jobId} failed after ${maxAttempts} attempts.`,
        );
      }

      throw error;
    }
  },
  { connection: redisConnection, concurrency: 5 },
);

/**
 * 2.(Delivery Worker)
 *
 */
const deliveryWorker = new Worker<DeliveryJobData>(
  "delivery-queue",
  async (job: Job<DeliveryJobData>) => {
    const { jobId, subscriberId, url, payload } = job.data;
    const maxAttempts = job.opts.attempts || 5;
    const currentAttempt = (job.attemptsMade || 0) + 1;
    const pendingLog = await deliveryQueries.logDeliveryAttempt({
      jobId,
      subscriberId,
      status: "pending",
      attemptNumber: currentAttempt,
    });

    const result: DeliveryResult = await deliverToSubscriber(
      subscriberId,
      url,
      payload,
    );

    let finalStatus: DeliveryStatus = result.success ? "success" : "failed";

    if (!result.success && currentAttempt < maxAttempts) {
      finalStatus = "retrying";
    }

    await deliveryQueries.updateDeliveryAttempt(pendingLog.id, {
      status: finalStatus,
      responseCode: result.status,
      durationMs: result.durationMs,
      errorType: result.error,
    });

    if (!result.success) {
      throw new Error(`Delivery attempt ${currentAttempt} failed for ${url}`);
    }
  },
  { connection: redisConnection, concurrency: 10 },
);

// (Monitoring)
processingWorker.on("completed", (job) =>
  console.log(`✅ Job ${job.id} Fanned out to subscribers`),
);
deliveryWorker.on("completed", (job) =>
  console.log(`🚀 Webhook delivered successfully to ${job.data.url}`),
);
deliveryWorker.on("failed", (job, err) =>
  console.error(`❌ Delivery failed for ${job?.data.url}: ${err.message}`),
);
