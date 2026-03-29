import { ActionStrategy } from "./action.strategy.js";
import { EnrichConfig, JsonPayload } from "../../../shared/types.js";

export class EnrichStrategy implements ActionStrategy<EnrichConfig> {
  execute(
    payload: JsonPayload,
    config: EnrichConfig,
    context?: { jobId?: string }
  ): JsonPayload {
    return {
      ...payload,
      ...config.extraData,
      _metadata: {
        jobId: context?.jobId,
        processedAt: new Date().toISOString(),
        service: "HookPipe-Worker",
      },
    };
  }
}