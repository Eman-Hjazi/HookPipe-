import { Router } from "express";
import * as JobsController from "../controllers/jobs.controller.js";
import { validate } from "../middlewares/validate.js";
import { getJobSchema } from "../validations/job.schema.js";

const router = Router();

router.get("/:id", validate(getJobSchema), JobsController.getJobStatus);
router.get(
  "/:id/attempts",
  validate(getJobSchema),
  JobsController.getJobAttempts,
);

export default router;
