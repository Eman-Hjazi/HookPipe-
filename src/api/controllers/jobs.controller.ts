import { Request, Response, NextFunction } from "express";
import { InferSelectModel } from "drizzle-orm";
import { jobs, deliveryAttempts } from "../../db/schema.js";
import * as JobQueries from "../../db/queries/jobs.js";
import * as DeliveryQueries from "../../db/queries/deliveryAttempts.js";

type JobRecord = InferSelectModel<typeof jobs>;
type DeliveryAttemptRecord = InferSelectModel<typeof deliveryAttempts>;

interface JobStatusResponse {
  success: boolean;
  message?: string;
  data?: JobRecord;
}

interface JobAttemptsResponse {
  success: boolean;
  message?: string;
  data?: DeliveryAttemptRecord[];
}

type JobParams = {
  id: string;
};

export const getJobStatus = async (
  req: Request<JobParams>,
  res: Response<JobStatusResponse>,
  next: NextFunction,
): Promise<void> => {

  try {
    const job = await JobQueries.getJobById(req.params.id);
    if (!job) {
      res.status(404).json({ success: false, message: "Job not found" });
      return; 
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (err) {
    next(err);
  }
};

export const getJobAttempts = async (
  req: Request<JobParams>,
  res: Response<JobAttemptsResponse>,
  next: NextFunction,
) => {
  try {
    const jobExists = await JobQueries.getJobById(req.params.id);
    if (!jobExists) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const attempts = await DeliveryQueries.getAttemptsByJobId(req.params.id);

    return res.status(200).json({
      success: true,
      data: attempts,
    });
  } catch (err) {
    next(err);
  }
};
