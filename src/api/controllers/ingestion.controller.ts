// src/api/controllers/ingestion.controller.ts
import { Request, Response, NextFunction } from "express";
import * as PipelineQueries from "../../db/queries/pipelines.js";
import * as JobQueries from "../../db/queries/jobs.js";
import { webhookQueue } from "../../shared/queue.js";
export const ingest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sourcePath } = req.params;
    const payload = req.body;
    if (typeof sourcePath !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid source path format",
      });
    }
    const pipeline = await PipelineQueries.getPipelineByPath(sourcePath);

    if (!pipeline) {
      return res
        .status(404)
        .json({ success: false, message: "Pipeline not found" });
    }

    if (!pipeline.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "Pipeline is inactive" });
    }

    const newJob = await JobQueries.createJob(pipeline.id, payload);
    await webhookQueue.add("process-webhook", {
      jobId: newJob.id,
      pipelineId: pipeline.id,
      payload: payload,
    });
    return res.status(202).json({
      success: true,
      message: "Webhook received and queued for processing",
    });
  } catch (error) {
    next(error);
  }
};
