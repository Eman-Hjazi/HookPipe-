// src/api/routes/ingestion.ts
import { Router } from "express";
import * as ingestionController from "../controllers/ingestion.controller.js";
import { validate } from "../middlewares/validate.js";
import { ingestionSchema } from "../validations/ingestion.schema.js";

const router = Router();

router.post(
  "/:sourcePath",
  validate(ingestionSchema),
  ingestionController.ingest,
);

export default router;
