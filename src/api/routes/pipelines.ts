import { Router } from "express";
import * as PipelineController from "../controllers/pipelines.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  createPipelineSchema,
  updatePipelineSchema,
} from "../validations/pipeline.schema.js";

const router = Router();
router.post("/", validate(createPipelineSchema), PipelineController.create);

router.get("/", PipelineController.list);
router.get("/:sourcePath", PipelineController.getOne);
router.patch("/:id", validate(updatePipelineSchema), PipelineController.update);
router.delete("/:id", PipelineController.remove);
export default router;
