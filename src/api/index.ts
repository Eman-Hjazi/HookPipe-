const PORT = process.env.PORT || 3000;

function startApi() {
  console.log(`[HookPipe-API]: Service is starting on port ${PORT}...`);

  console.log("[HookPipe-API]: Ready to ingest webhooks and queue jobs.");
}

startApi();
