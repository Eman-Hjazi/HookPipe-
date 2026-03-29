import { describe, it, expect } from "vitest";

import { TransformStrategy } from "./strategies/transform.strategy.js";
import { FilterStrategy } from "./strategies/filter.strategy.js";
import { EnrichStrategy } from "./strategies/enrich.strategy.js";

import {
  TransformConfig,
  FilterConfig,
  EnrichConfig,
  JsonPayload,
} from "../../shared/types.js";

describe("Worker Actions Unit Tests", () => {
  describe("TransformStrategy", () => {
  const strategy = new TransformStrategy();

  it("should correctly remap payload fields", () => {
    const payload: JsonPayload = { old_key: "value", stay: "same" };
    const config: TransformConfig = { mapping: { old_key: "new_key" } };

    const result = strategy.execute(payload, config);

    expect(result).toEqual({ new_key: "value", stay: "same" });
    expect(result).not.toHaveProperty("old_key");
  });

  it("should keep original keys if no mapping exists", () => {
    const payload: JsonPayload = { unknown_key: "value" };
    const config: TransformConfig = { mapping: { other: "key" } };

    const result = strategy.execute(payload, config);

    expect(result).toEqual({ unknown_key: "value" });
  });
});

 describe("FilterStrategy", () => {
  const strategy = new FilterStrategy();

  it('should return payload when "equals" condition is met', () => {
    const payload: JsonPayload = { status: "active" };
    const config: FilterConfig = {
      field: "status",
      operator: "equals",
      value: "active",
    };

    expect(strategy.execute(payload, config)).toEqual(payload);
  });

  it('should return null when condition fails', () => {
    const payload: JsonPayload = { status: "inactive" };
    const config: FilterConfig = {
      field: "status",
      operator: "equals",
      value: "active",
    };

    expect(strategy.execute(payload, config)).toBeNull();
  });

  it('should handle "greater_than"', () => {
    const payload: JsonPayload = { price: 100 };
    const config: FilterConfig = {
      field: "price",
      operator: "greater_than",
      value: 50,
    };

    expect(strategy.execute(payload, config)).toEqual(payload);
  });

  it("should throw error for invalid operator", () => {
    const payload: JsonPayload = { data: 1 };

    const config = {
      field: "data",
      operator: "invalid",
    } as unknown as FilterConfig;

    expect(() => strategy.execute(payload, config)).toThrow();
  });
});

describe("EnrichStrategy", () => {
  const strategy = new EnrichStrategy();

  it("should merge data and add metadata", () => {
    const payload: JsonPayload = { user: "eman" };
    const config: EnrichConfig = { extraData: { role: "admin" } };

    const result = strategy.execute(payload, config, {
      jobId: "test-job-123",
    });

    expect(result).toMatchObject({
      user: "eman",
      role: "admin",
      _metadata: {
        jobId: "test-job-123",
        service: "HookPipe-Worker",
      },
    });

    expect(result._metadata).toHaveProperty("processedAt");
  });
});
});
