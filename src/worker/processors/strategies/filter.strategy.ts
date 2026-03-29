import { ActionStrategy } from "./action.strategy.js";
import { FilterConfig, JsonPayload } from "../../../shared/types.js";

export class FilterStrategy implements ActionStrategy<FilterConfig> {
  execute(payload: JsonPayload, config: FilterConfig): JsonPayload | null {
    const { field, operator, value } = config;

    const payloadValue = payload[field];
    if (payloadValue === undefined) return null;

    switch (operator) {
      case "equals":
        return payloadValue === value ? payload : null;

      case "contains":
        return String(payloadValue).includes(String(value)) ? payload : null;

      case "greater_than":
        return Number(payloadValue) > Number(value) ? payload : null;

      case "less_than":
        return Number(payloadValue) < Number(value) ? payload : null;

      default:
        throw new Error("Invalid Filter Configuration");
    }
  }
}