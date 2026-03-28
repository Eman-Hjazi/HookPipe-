import { describe, it, expect, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { ingest } from "./ingestion.controller.js";
import * as PipelineQueries from "../../db/queries/pipelines.js";
import * as JobQueries from "../../db/queries/jobs.js";
import { webhookQueue } from "../../shared/queue.js";
import { JsonPayload, PipelineWithSubscribers } from "../../shared/types.js";
import { Job } from "../../db/schema.js";
vi.mock("../../db/queries/pipelines.js");
vi.mock("../../db/queries/jobs.js");
vi.mock("../../shared/queue.js");

describe("Ingestion Controller", () => {
  const createMockResponse = () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    return res;
  };

  it("should return 404 if pipeline is not found", async () => {
    vi.mocked(PipelineQueries.getPipelineByPath).mockResolvedValue(null);

    const req = {
      params: { sourcePath: "not-found-12" },
      body: { event: "test" },
    } as unknown as Request<{ sourcePath: string }, unknown, JsonPayload>;

    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    await ingest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it("should return 403 if pipeline is inactive", async () => {
    vi.mocked(PipelineQueries.getPipelineByPath).mockResolvedValue({
      isActive: false,
    } as PipelineWithSubscribers);

    const req = {
      params: { sourcePath: "inactive-p12" },
      body: { event: "test" },
    } as unknown as Request<{ sourcePath: string }, unknown, JsonPayload>;

    const res = createMockResponse();

    await ingest(req, res, vi.fn() as NextFunction);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Pipeline is currently inactive",
      }),
    );
  });

  it("should return 202 and queue the job when valid", async () => {
    vi.mocked(PipelineQueries.getPipelineByPath).mockResolvedValue({
      id: "p1",
      isActive: true,
    } as PipelineWithSubscribers);

    vi.mocked(JobQueries.createJob).mockResolvedValue({
      id: "job-123",
    } as Job);

    const req = {
      params: { sourcePath: "valid-path12" },
      body: { data: "hello" },
    } as unknown as Request<{ sourcePath: string }, unknown, JsonPayload>;

    const res = createMockResponse();

    await ingest(req, res, vi.fn() as NextFunction);

    expect(res.status).toHaveBeenCalledWith(202);
    expect(webhookQueue.add).toHaveBeenCalledWith(
      "process-webhook",
      expect.objectContaining({ jobId: "job-123" }),
    );
  });
});
