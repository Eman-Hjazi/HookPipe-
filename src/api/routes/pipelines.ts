import { Router } from "express";
import * as PipelineController from "../controllers/pipelines.controller.js";

const router = Router();

router.post("/", PipelineController.create);

router.get("/", PipelineController.list);

router.get("/:sourcePath", PipelineController.getOne);

router.patch("/:id", PipelineController.update);

router.delete("/:id", PipelineController.remove);

export default router;
