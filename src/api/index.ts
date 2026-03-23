import express from "express";
import ingestionRouter from "./routes/ingestion.js";
import pipelinesRouter from "./routes/pipelines.js";

// src/api/index.ts
const PORT = process.env.PORT || 3000;
const app = express();

// body parser for JSON requests
app.use(express.json());

app.use("/api/webhook", ingestionRouter);
app.use("/api/pipelines", pipelinesRouter);

function startApi() {
  app.listen(PORT, () => {
    console.log(`[HookPipe-API]: Service is starting on port ${PORT}...`);
    console.log("[HookPipe-API]: Ready to ingest webhooks and queue jobs.");
  });
}
startApi();
