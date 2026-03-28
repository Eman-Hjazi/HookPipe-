import { describe, it, expect } from "vitest";
import { deliveryQueue } from "./queue.js";

describe("Queue Configuration", () => {
  it("should have correct retry and backoff settings", () => {
    const options = deliveryQueue.opts.defaultJobOptions;
    expect(options?.attempts).toBe(5);
    expect(options?.backoff).toMatchObject({
      type: "exponential",
      delay: 1000,
    });
  });
});
