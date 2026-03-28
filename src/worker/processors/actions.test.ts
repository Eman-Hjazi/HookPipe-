import { describe, it, expect } from "vitest";
import { transformAction, filterAction, enrichAction } from "./actions.js";
import {
  TransformConfig,
  FilterConfig,
  EnrichConfig,
  JsonPayload,
} from "../../shared/types.js";

describe("Worker Actions Unit Tests", () => {
  describe("transformAction", () => {
    it("should correctly remap payload fields based on mapping config", () => {
      const payload: JsonPayload = { old_key: "value", stay: "same" };
      const config: TransformConfig = { mapping: { old_key: "new_key" } };

      const result = transformAction(payload, config);

      expect(result).toEqual({ new_key: "value", stay: "same" });
      expect(result).not.toHaveProperty("old_key");
    });

    it("should return the original key if no mapping is found in config", () => {
      const payload: JsonPayload = { unknown_key: "value" };
      const config: TransformConfig = { mapping: { other: "key" } };

      const result = transformAction(payload, config);
      expect(result).toEqual({ unknown_key: "value" });
    });
  });

  describe("filterAction", () => {
    it('should return payload when "equals" condition is met', () => {
      const payload: JsonPayload = { status: "active" };
      const config: FilterConfig = {
        field: "status",
        operator: "equals",
        value: "active",
      };

      expect(filterAction(payload, config)).toEqual(payload);
    });

    it('should return null when "equals" condition fails', () => {
      const payload: JsonPayload = { status: "inactive" };
      const config: FilterConfig = {
        field: "status",
        operator: "equals",
        value: "active",
      };

      expect(filterAction(payload, config)).toBeNull();
    });

    it('should handle "greater_than" for numeric values', () => {
      const payload: JsonPayload = { price: 100 };
      const config: FilterConfig = {
        field: "price",
        operator: "greater_than",
        value: 50,
      };

      expect(filterAction(payload, config)).toEqual(payload);
    });

    it("should throw an error for invalid configuration", () => {
      const payload: JsonPayload = { data: 1 };
      // @ts-expect-error: testing invalid operator at runtime
      const config: FilterConfig = { field: "data", operator: "invalid" };

      expect(() => filterAction(payload, config)).toThrow(
        "Invalid Filter Configuration",
      );
    });
  });

  describe("enrichAction", () => {
    it("should merge extra data and add metadata correctly", () => {
      const payload: JsonPayload = { user: "eman" };
      const config: EnrichConfig = { extraData: { role: "admin" } };
      const jobId = "test-job-123";

      const result = enrichAction(payload, config, jobId);

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
