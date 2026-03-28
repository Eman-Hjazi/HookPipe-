import { Request, Response, NextFunction } from "express";
import * as PipelineQueries from "../../db/queries/pipelines.js";
import * as JobQueries from "../../db/queries/jobs.js";
import { webhookQueue } from "../../shared/queue.js";
import { JsonPayload } from "../../shared/types.js";

interface IngestionResponse {
  success: boolean;
  message: string;
  jobId?: string;
}

export const ingest = async (
  req: Request<{ sourcePath: string }, IngestionResponse, JsonPayload>,
  res: Response<IngestionResponse>,
  next: NextFunction,
) => {
  try {
    const { sourcePath } = req.params;
    const payload = req.body as JsonPayload;
    const pipeline = await PipelineQueries.getPipelineByPath(sourcePath);

    if (!pipeline) {
      return res
        .status(404)
        .json({ success: false, message: "Pipeline not found" });
    }

    if (!pipeline.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "Pipeline is currently inactive" });
    }

    const newJob = await JobQueries.createJob(pipeline.id, payload);

    await webhookQueue.add("process-webhook", {
      jobId: newJob.id,
      pipelineId: pipeline.id,
      payload: payload,
    });

    return res.status(202).json({
      success: true,
      message: "Webhook accepted and queued for processing",
      jobId: newJob.id,
    });
  } catch (error) {
    next(error);
  }
};
