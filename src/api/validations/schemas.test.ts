import { describe, it, expect } from "vitest";
import { ingestionSchema } from "./ingestion.schema.js";
import { createPipelineSchema } from "./pipeline.schema.js";

describe("Validation Schemas Tests", () => {
  describe("Ingestion Schema", () => {
    it("should fail if sourcePath is not exactly 12 characters", () => {
      const result = ingestionSchema.safeParse({
        params: { sourcePath: "too-short" },
        body: { data: "test" },
      });
      expect(result.success).toBe(false);
    });

    it("should fail if payload body is empty", () => {
      const result = ingestionSchema.safeParse({
        params: { sourcePath: "123456789012" },
        body: {},
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Pipeline Creation Schema", () => {
    it("should fail if subscriberUrls contains an invalid URL", () => {
      const result = createPipelineSchema.safeParse({
        body: {
          name: "Test Pipeline",
          action: {
            actionType: "filter",
            actionConfig: { field: "a", operator: "equals", value: 1 },
          },
          subscriberUrls: ["not-a-url"],
        },
      });
      expect(result.success).toBe(false);
    });
  });
});
