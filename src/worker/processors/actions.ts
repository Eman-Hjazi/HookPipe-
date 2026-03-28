import {
  JsonPayload,
  TransformConfig,
  FilterConfig,
  EnrichConfig,
} from "../../shared/types.js";

export const transformAction = (
  payload: JsonPayload,
  config: TransformConfig,
): JsonPayload => {
  const { mapping } = config;
  const result: JsonPayload = {};
  Object.keys(payload).forEach((key) => {
    const newKey = mapping[key] || key;
    result[newKey] = payload[key];
  });
  return result;
};

export const filterAction = (
  payload: JsonPayload,
  config: FilterConfig,
): JsonPayload | null => {
  const { field, operator, value } = config;
  if (!field || !operator) {
    throw new Error(`Invalid Filter Configuration: missing field or operator`);
  }
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
      throw new Error(`Invalid Filter Configuration: unknown operator ${operator}`);
  }
};

export const enrichAction = (
  payload: JsonPayload,
  config: EnrichConfig,
  jobId: string,
): JsonPayload => {
  const { extraData } = config;
  return {
    ...payload,
    ...extraData,
    _metadata: {
      jobId,
      processedAt: new Date().toISOString(),
      service: "HookPipe-Worker",
    },
  };
};
