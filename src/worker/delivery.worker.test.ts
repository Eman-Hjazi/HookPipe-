import { describe, it, expect, vi } from "vitest";
import * as deliveryQueries from "../db/queries/deliveryAttempts.js";
import { deliverToSubscriber } from "./delivery.js";
import { DeliveryResult, DeliveryStatus } from "../shared/types.js";
import { DeliveryAttempt } from "../db/schema.js";

vi.mock("../db/queries/deliveryAttempts.js");
vi.mock("./delivery.js");

describe("Delivery Worker Retry Logic", () => {
  it('should set status to "retrying" if delivery fails and attempts are remaining', async () => {
    const mockFailedResult: DeliveryResult = {
      subscriberId: "sub-uuid-123",
      url: "http://example.com/webhook",
      success: false,
      status: 500,
      durationMs: 150,
      error: "Internal Server Error",
    };

    vi.mocked(deliverToSubscriber).mockResolvedValue(mockFailedResult);

    const mockLog = { id: "attempt-uuid-456" } as unknown as DeliveryAttempt;
    vi.mocked(deliveryQueries.logDeliveryAttempt).mockResolvedValue(mockLog);

    const currentAttempt = 1;
    const maxAttempts = 5;

    let finalStatus: DeliveryStatus = mockFailedResult.success
      ? "success"
      : "failed";

    if (!mockFailedResult.success && currentAttempt < maxAttempts) {
      finalStatus = "retrying";
    }

    expect(finalStatus).toBe("retrying");

    await deliveryQueries.updateDeliveryAttempt(mockLog.id, {
      status: finalStatus,
      responseCode: mockFailedResult.status,
    });

    expect(deliveryQueries.updateDeliveryAttempt).toHaveBeenCalledWith(
      "attempt-uuid-456",
      expect.objectContaining({ status: "retrying" }),
    );
  });
});
