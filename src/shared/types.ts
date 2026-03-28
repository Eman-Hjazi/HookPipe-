import {
  deliveryStatusEnum,
  actionTypeEnum,
  Pipeline,
  Subscriber,
  jobStatusEnum,
} from "../db/schema.js";
export type ActionType = (typeof actionTypeEnum.enumValues)[number];
export type JobStatus = (typeof jobStatusEnum.enumValues)[number];
export type DeliveryStatus = (typeof deliveryStatusEnum.enumValues)[number];

export type JsonPayload = Record<string, unknown>;

export type TransformConfig = {
  mapping: Record<string, string>;
};

export type FilterConfig = {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than";
  value: unknown;
};

export type EnrichConfig = {
  extraData: Record<string, unknown>;
};
export type ActionConfig = TransformConfig | FilterConfig | EnrichConfig;

export type Action =
  | { actionType: "transform"; actionConfig: TransformConfig }
  | { actionType: "filter"; actionConfig: FilterConfig }
  | { actionType: "enrich"; actionConfig: EnrichConfig };

export interface DeliveryResult {
  subscriberId: string;
  url: string;
  success: boolean;
  status?: number;
  error?: string;
  durationMs: number;
}

export type PipelineWithSubscribers = Pipeline & {
  subscribers: Subscriber[];
};

export interface DeliveryAttemptLog {
  jobId: string;
  subscriberId: string;
  status: DeliveryStatus;
  responseCode?: number;
  durationMs?: number;
  errorType?: string;
  attemptNumber: number;
}
