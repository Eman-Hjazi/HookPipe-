import express from "express";
import pipelinesRouter from "./routes/pipelines.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import ingestionRoutes from "./routes/ingestion.js";

// src/api/index.ts
const PORT = process.env.PORT || 3000;
const app = express();

// body parser for JSON requests
app.use(express.json());
app.use("/api/ingest", ingestionRoutes);
app.use("/api/pipelines", pipelinesRouter);
app.use(errorHandler);
function startApi() {
  app.listen(PORT, () => {
    console.log(`[HookPipe-API]: Service is starting on port ${PORT}...`);
    console.log("[HookPipe-API]: Ready to ingest webhooks and queue jobs.");
  });
}
startApi();
