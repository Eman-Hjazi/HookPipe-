# HookPipe 🚀

![CI Status](https://github.com/Eman-Hjazi/HookPipe-/actions/workflows/ci.yml/badge.svg)

**HookPipe** is a scalable, webhook-driven task processing pipeline. It is designed to ingest inbound events, queue them for background processing via Redis, and deliver results to subscribers with built-in reliability.

## 📌 Overview
The service allows users to create **pipelines** that connect:
1. **Source:** A unique URL for incoming webhooks.
2. **Processing Action:** Background logic to transform or filter data.
3. **Subscribers:** Automated delivery to destination URLs with **Retry Logic**.

## 🏗️ Architecture & Design Decisions
To ensure **Reliability** and **Separation of Concerns**, the project is structured into decoupled services:
* **API Service:** Handles pipeline CRUD and high-speed webhook ingestion using Redis as a buffer.
* **Worker Service:** An isolated background consumer that processes jobs from the queue.
* **Message Queue (Redis):** Orchestrates communication between API and Worker using BullMQ.
* **Database (PostgreSQL):** Stores pipeline configurations and job execution history.

## 📂 Project Structure
A strictly typed, modular directory structure designed for maximum maintainability:

```text
src/
├── api/             # Webhook ingestion & Pipeline management
│   ├── controllers/ # Request handlers (Business logic)
│   ├── routes/      # Endpoint definitions
│   ├── middlewares/ # Validation, Error handling & Auth guards
│   └── validations/ # Zod schemas for request integrity
├── db/              # Persistence layer
│   ├── migrations/  # Drizzle SQL migration history
│   ├── queries/     # Database Access Objects (DAO/Repository)
│   └── schema.ts    # Single source of truth for DB tables
├── worker/          # Background processing service
│   ├── processors/  # Logic for Transform, Filter, and Enrich actions
│   └── index.ts     # Worker initialization and BullMQ handlers
├── shared/          # Cross-cutting concerns
│   ├── queue.ts     # Redis connection & Queue shared instances
```

## 🔌 API Documentation

### Webhook Ingestion
* **Ingest Webhook** (`POST /api/ingest/:sourcePath`)
    * **Description:** Receives external data and pushes it to the background queue.
    * **Response:** `202 Accepted` (processing happens asynchronously).

### Pipeline Management
* **Create Pipeline** (`POST /api/pipelines`)
    * **Payload:** `{ "name": "string", "actionType": "transform|filter", "subscriberUrls": [] }`.
* **Get Pipeline** (`GET /api/pipelines/:sourcePath`)
* **Update Pipeline** (`PATCH /api/pipelines/:id`)

## 🛠️ Tech Stack
* **Backend:** TypeScript & Node.js (Fastify/Express).
* **ORM:** Drizzle ORM (PostgreSQL).
* **Queue Management:** BullMQ & Redis.
* **Infrastructure:** Docker & Docker Compose.
* **CI/CD:** GitHub Actions (Linting, Type-checking).

## 🚀 Roadmap & Progress
- [x] **Initial Setup:** Project initialization and base configuration.
- [x] **Infrastructure:** Dockerizing services (PostgreSQL, Redis).
- [x] **CI/CD Pipeline:** GitHub Actions for automated quality checks.
- [x] **Pipeline Management:** CRUD API for pipeline orchestration.
- [x] **Core Logic - Ingestion:** Redis-backed queuing for incoming webhooks.
- [ ] **Core Logic - Worker:** Implementation of Transform and Filter processors.
- [ ] **Reliability:** Delivery attempt tracking and exponential backoff retries.

## ⚙️ Getting Started

### 1. Environment Configuration
Copy the template to your `.env` file:
```bash
cp .env.example .env
```

### 2. Running the Service

```bash
docker compose up --build
``` 
