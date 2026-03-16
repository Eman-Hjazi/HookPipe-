# HookPipe 🚀

![CI Status](https://github.com/EmanHjazi/HookPipe/actions/workflows/ci.yml/badge.svg)

**HookPipe** is a robust, webhook-driven task processing pipeline (Zapier-like service). It is designed to ingest inbound events, queue them for background processing, and deliver results to subscribers with built-in reliability.

## 📌 Overview
The service allows users to create pipelines that connect:
1.  **Source:** A unique URL for incoming webhooks.
2.  **Processing Action:** Background logic to transform or filter data (e.g., Transformation, Filtering, Enrichment).
3.  **Subscribers:** Automated delivery to destination URLs with **Retry Logic** for failures.

## 🏗️ Architecture & Design Decisions (Planned)
To ensure **Reliability** and **Separation of Concerns**, the project is structured into decoupled services:
*   **API Service:** Manages pipeline CRUD and initial webhook ingestion without blocking the main event loop.
*   **Worker Service:** Asynchronously executes jobs from the queue to ensure high availability.
*   **Database (PostgreSQL):** Used for robust job tracking, history, and pipeline management.

## 📂 Project Structure
The project follows a modular structure to ensure maintainability and code quality:
```text
src/
├── api/      # Webhook ingestion & Pipeline management
├── db/       # Schema definitions & Database setup
├── worker/   # Background processing logic
├── shared/   # Common types and utilities
```

## 🛠️ Tech Stack
*   **Language:** TypeScript (Strict Typing)
*   **Infrastructure:** Docker & Docker Compose
*   **CI/CD:** GitHub Actions for automated linting, type-checking, and build verification.

## 🚀 Roadmap & Progress
- [x] **Initial Setup:** Project initialization with TypeScript and base configuration.
- [ ] **Infrastructure (Planned):** Dockerizing the services and setting up PostgreSQL.
- [ ] **CI/CD Pipeline (Planned):** Configuring GitHub Actions to ensure a "Passing CI pipeline" on every PR.
- [ ] **Core Logic (Planned):** Implementing Webhook ingestion and background workers.
- [ ] **Reliability Features (Planned):** Implementing Retry Logic and job status tracking.

## ⚙️ Getting Started (Planned)
Once the infrastructure is ready, the full service will run via:
```bash
docker compose up --build
```
