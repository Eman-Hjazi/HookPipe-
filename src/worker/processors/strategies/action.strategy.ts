import { JsonPayload } from "../../../shared/types.js";

export interface ActionStrategy<TConfig = unknown> {
  execute(
    payload: JsonPayload,
    config: TConfig,
    context?: { jobId?: string }
  ): Promise<JsonPayload | null> | JsonPayload | null;
}