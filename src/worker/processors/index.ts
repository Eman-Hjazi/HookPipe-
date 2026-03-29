// src/worker/processors/index.ts
import { actionRegistry } from "./strategies/action.registry.js";
import * as jobQueries from "../../db/queries/jobs.js";
import { JsonPayload, Action } from "../../shared/types.js";

export const processAction = async (
  action: Action,
  payload: JsonPayload,
  jobId: string,
): Promise<JsonPayload | null> => {
  try {
    const strategy = actionRegistry.get(action.actionType);

    return await strategy.execute(payload, action.actionConfig, {
      jobId,
    });

  } catch (error) {
    await jobQueries.incrementRetryCount(jobId);
    throw error;
  }
};