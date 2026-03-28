import express from "express";
import pipelinesRouter from "./routes/pipelines.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import ingestionRoutes from "./routes/ingestion.js";
import jobsRouter from "./routes/jobs.js";

const PORT = process.env.PORT || 3000;
const app = express();


app.use(express.json({ limit: "1mb" }));
app.use("/api/ingest", ingestionRoutes);
app.use("/api/pipelines", pipelinesRouter);
app.use("/api/jobs", jobsRouter);
app.use(errorHandler);
function startApi() {
  app.listen(PORT, () => {
    console.log(`[HookPipe-API]: Service is starting on port ${PORT}...`);
    console.log("[HookPipe-API]: Ready to ingest webhooks and queue jobs.");
  });
}
startApi();
