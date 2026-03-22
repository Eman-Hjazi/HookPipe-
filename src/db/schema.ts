import { pgTable, uuid, text, jsonb, timestamp, integer, boolean, pgEnum, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- 1. ENUMS
export const actionTypeEnum = pgEnum("action_type", ["transform", "filter", "enrich"]);

export const jobStatusEnum = pgEnum("job_status", ["pending", "processing", "completed", "failed"]);

export const deliveryStatusEnum = pgEnum("delivery_status", ["pending", "success", "failed", "retrying"]);

// --- 2. TABLES
export const pipelines = pgTable("pipelines", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  sourcePath: text("source_path").notNull().unique(), 
  isActive: boolean("is_active").default(true).notNull(),
  actionType: actionTypeEnum("action_type").notNull(),
  actionConfig: jsonb("action_config").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  pipelineId: uuid("pipeline_id")
    .references(() => pipelines.id, { onDelete: "cascade" })
    .notNull(),
  url: text("url").notNull(), 
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  pipelineId: uuid("pipeline_id").references(() => pipelines.id, { onDelete: "cascade" }),
  status: jobStatusEnum("status").notNull().default("pending"), 
  payload: jsonb("payload").notNull(), 
  processedData: jsonb("processed_data"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0).notNull(),
  lockedAt: timestamp("locked_at"), 
  lockedBy: text("locked_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => {
  return {
    statusIdx: index("status_idx").on(table.status),
  };
});

export const deliveryAttempts = pgTable("delivery_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "cascade" }),
  subscriberId: uuid("subscriber_id").references(() => subscribers.id, { onDelete: "cascade" }),
  status: deliveryStatusEnum("status").notNull(), 
  responseCode: integer("response_code"), 
  durationMs: integer("duration_ms"), 
  errorType: text("error_type"), 
  attemptNumber: integer("attempt_number").default(1).notNull(),
  nextAttemptAt: timestamp("next_attempt_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- 3. RELATIONS

export const pipelinesRelations = relations(pipelines, ({ many }) => ({
  subscribers: many(subscribers),
  jobs: many(jobs),
}));

export const subscribersRelations = relations(subscribers, ({ one }) => ({
  pipeline: one(pipelines, {
    fields: [subscribers.pipelineId],
    references: [pipelines.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  pipeline: one(pipelines, {
    fields: [jobs.pipelineId],
    references: [pipelines.id],
  }),
  deliveryAttempts: many(deliveryAttempts),
}));


export const deliveryAttemptsRelations = relations(deliveryAttempts, ({ one }) => ({
  job: one(jobs, {
    fields: [deliveryAttempts.jobId],
    references: [jobs.id],
  }),
  subscriber: one(subscribers, {
    fields: [deliveryAttempts.subscriberId],
    references: [subscribers.id],
  }),
}));