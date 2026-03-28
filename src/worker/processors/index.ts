import { transformAction, filterAction, enrichAction } from "./actions.js";
import * as jobQueries from "../../db/queries/jobs.js";
import { JsonPayload, Action } from "../../shared/types.js";

export const processAction = async (
  action: Action,
  payload: JsonPayload,
  jobId: string,
): Promise<JsonPayload | null> => {
  console.log(
    `[Worker] ⚙️ Processing Job: ${jobId} | Action: ${action.actionType}`,
  );

  try {
    switch (action.actionType) {
      case "transform":
        return transformAction(payload, action.actionConfig);

      case "filter":
        return filterAction(payload, action.actionConfig);

      case "enrich":
        return enrichAction(payload, action.actionConfig, jobId);

      default:
        console.warn(`[Worker] ⚠️ Unsupported action.`);
        return payload;
    }
  } catch (error) {
    console.error(`[Worker-Error] ❌ Logic failed for Job ${jobId}:`, error);

    await jobQueries.incrementRetryCount(jobId);

    throw error;
  }
};
