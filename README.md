# Content & Media Distribution Pipeline

A self-hosted automation pipeline that turns a single rough content idea into four platform-ready posts — LinkedIn, X/Twitter, Instagram, and YouTube — using n8n, the Anthropic Claude API, and Notion as the source of truth.

Built as a portfolio project demonstrating end-to-end AI automation: prompt engineering for structured output, defensive validation, parallel API orchestration, error handling, and a full audit trail — all fully self-hosted in Docker.

---

## What It Does

1. **You write one rough idea** into a Notion database — a title and a paragraph of unstructured notes.
2. **n8n polls Notion** every 5 minutes for anything marked `Ready for AI Processing`.
3. **Claude reformats that single idea into four platform-native versions** in one API call — a structured LinkedIn post, a Twitter/X thread, an Instagram caption with hashtags, and full YouTube title/description/timestamps — returned as strict JSON.
4. **The output is validated** before anything downstream happens, catching malformed AI output before it propagates.
5. **Each format is sent to its own endpoint** in a self-built distribution layer, standing in for wherever finished content would actually get handed off (a scheduling tool, a client's own API, etc.).
6. **A live dashboard** renders each generated post as a styled card — the visual proof that content was generated and routed correctly.
7. **Notion gets updated** — `Status: Scheduled`, all four outputs saved back, a timestamp recorded.
8. **Every run — success or failure — is logged to PostgreSQL** for a full audit trail.

If a row is missing content, or the AI's output comes back malformed, the pipeline doesn't crash — it catches the failure, logs the reason, and writes it back to Notion as `Status: Error` instead of failing silently.

---


## Tech Stack

- **n8n** — self-hosted workflow orchestration
- **Anthropic Claude API** (Claude Haiku) — structured multi-format content generation
- **Notion API** — source database and feedback/write-back sink
- **PostgreSQL** — execution audit log
- **Node.js / Express** — custom distribution layer + live dashboard
- **Docker & Docker Compose** — full local containerized stack

---

## Key Design Decisions

- **Input validated before the LLM call, not just after.** A dedicated IF node catches incomplete source data (e.g. empty content) before spending an API call on it — cheaper and more correct than validating output alone.
- **Structured JSON contract enforced at the LLM boundary.** The system prompt forces Claude to return only a single JSON object; a defensive Code node parses and validates it (required keys, Twitter character limits, YouTube metadata shape) before anything branches downstream.
- **Nothing fails silently.** Any failure point — bad source data, malformed AI output — is caught, logged with a reason, and written back to Notion as `Status: Error`, with a parallel log to PostgreSQL.
- **Self-built distribution layer instead of a named third-party integration.** Rather than claiming a live connection to a platform never actually connected, generated content is posted to a distribution layer you control — honest about what's real, and destination-agnostic: pointing it at a real scheduling API later is a config change, not a rebuild.
- **Dashboard as visual verification.** A styled, auto-refreshing dashboard turns "four HTTP calls succeeded" into "here's what actually got scheduled to four platforms."

---

## Project Structure

```
content-distribution-pipeline/
├── docker-compose.yml
├── .env.example
├── distribution-layer/
│   ├── Dockerfile
│   ├── server.js
│   ├── package.json
│   └── public/
│       └── dashboard.html
├── sql/
│   └── init.sql
├── workflows/
│   └── content-distribution.json
└── docs/
    ├── notion-schema.md
    └── architecture-diagram.png
```

---

## Setup

### Prerequisites
- Docker Desktop (with WSL2 backend on Windows) or native Linux Docker Engine
- A Notion account + integration ([notion.so/my-integrations](https://notion.so/my-integrations))
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

### Quick Start

```bash
git clone https://github.com/RefilweMohlala/content-distribution-pipeline.git
cd content-distribution-pipeline
cp .env.example .env
# fill in your NOTION_API_KEY, NOTION_DATABASE_ID, and ANTHROPIC_API_KEY in .env

docker compose up -d --build
```

Then:
1. Open `http://localhost:5678` and import the workflow from `workflows/content-distribution.json`.
2. Reconnect your Notion and PostgreSQL credentials inside n8n (these don't transfer between instances).
3. Create a Notion database matching the schema in `docs/notion-schema.md`, share it with your integration, and seed a test row with `Status: Ready for AI Processing`.
4. Execute the workflow and watch the dashboard at `http://localhost:5678` populate in real time.

Full step-by-step build instructions, including the exact Notion schema and every node's configuration, are documented in the accompanying build guide.

---

## Demo

📺 [Loom walkthrough](#) *(link here)*

The demo covers: a rough idea going into Notion, the full n8n execution, the live dashboard populating with generated content, the Notion write-back, and the error-handling path in action.

---

## About This Project

Built by [Refilwe Mohlala](https://refilwem.netlify.app) as part of a five-module AI automation portfolio, combining a background in cloud infrastructure (AWS, Docker, Kubernetes) with hands-on AI automation engineering — positioned for SME clients and remote automation contracts, with POPIA compliance and self-hosted architecture as core differentiators across all five projects.