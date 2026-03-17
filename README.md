# HookPipe 🚀

![CI Status](https://github.com/Eman-Hjazi/HookPipe-/actions/workflows/ci.yml/badge.svg)

**HookPipe** is a robust, webhook-driven task processing pipeline. It is designed to ingest inbound events, queue them for background processing, and deliver results to subscribers with built-in reliability.

## 📌 Overview
The service allows users to create **pipelines** that connect:
1.  **Source:** A unique URL for incoming webhooks.
2.  **Processing Action:** Background logic to transform or filter data (e.g., Transformation, Filtering, Enrichment).
3.  **Subscribers:** Automated delivery to destination URLs with **Retry Logic** for failures.

## 🏗️ Architecture & Design Decisions
To ensure **Reliability** and **Separation of Concerns**, the project is structured into decoupled services:
*   **API Service:** Manages pipeline CRUD and initial webhook ingestion without blocking the main event loop.
*   **Worker Service:** Asynchronously executes jobs from the queue to ensure high availability.
*   **Database (PostgreSQL):** Used for robust job tracking, history, and pipeline management.

## 📂 Project Structure
Following a modular structure to ensure maintainability and code quality:
```text
src/
├── api/      # Webhook ingestion & Pipeline management
├── db/       # Schema definitions & Database setup (Drizzle ORM)
├── worker/   # Background processing logic
├── shared/   # Common types, utilities, and configuration
```

## 🛠️ Tech Stack
*   **Language:** TypeScript (Strict Typing).
*   **Infrastructure:** Docker & Docker Compose.
*   **CI/CD:** GitHub Actions for automated linting, type-checking, and build verification.

## 🚀 Roadmap & Progress
- [x] **Initial Setup:** Project initialization with TypeScript and base configuration.
- [x] **Infrastructure:** Dockerizing services and setting up PostgreSQL for a "works on first try" setup.
- [x] **CI/CD Pipeline:** Configured GitHub Actions to ensure a "Passing CI pipeline".
- [ ] **Core Logic:** Implementing Webhook ingestion and background workers.
- [ ] **Reliability Features:** Implementing Retry Logic and job status tracking.

## ⚙️ Getting Started

### 1. Environment Configuration (.env.example)
To ensure the infrastructure works on the first try, a template file `.env.example` is provided. 
*   **Why?** It contains placeholders for database credentials (`POSTGRES_USER`, `POSTGRES_PASSWORD`) and the internal `DATABASE_URL` used by Docker services to communicate.
*   **Action:** You **must** copy this template to a new file named `.env` before starting the services:
    ```bash
    cp .env.example .env
    ```

### 2. Running the Service
The full service runs via a single command:
```bash
docker compose up --build
```
*The API will be available at `http://localhost:3000`.*
```
