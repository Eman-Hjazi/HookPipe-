import { ActionStrategy } from "./action.strategy.js";
import { TransformConfig, JsonPayload } from "../../../shared/types.js";

export class TransformStrategy implements ActionStrategy<TransformConfig> {
  execute(payload: JsonPayload, config: TransformConfig): JsonPayload {
    const result: JsonPayload = {};

    Object.keys(payload).forEach((key) => {
      const newKey = config.mapping[key] || key;
      result[newKey] = payload[key];
    });

    return result;
  }
}