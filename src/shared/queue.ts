import { Queue } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || "redis",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});

export const webhookQueue = new Queue("webhook-queue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
  },
});

export const deliveryQueue = new Queue("delivery-queue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: true,
  },
});
