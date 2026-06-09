<div align="center">

# 🐾 YellowClaw

**A minimal, self-hostable chatbot platform.**
Build user-owned agents, attach system prompts, and chat through OpenRouter — all in one focused workspace.

<p>
  <img alt="React" src="https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white">
  <img alt="Postgres" src="https://img.shields.io/badge/Postgres-16-4169E1?logo=postgresql&logoColor=white">
  <img alt="Node" src="https://img.shields.io/badge/Node-%E2%89%A520-339933?logo=nodedotjs&logoColor=white">
</p>

</div>

---

## ✨ Features

- 🔐 **Auth** — email/password register & login, HttpOnly + SameSite session cookies, `scrypt` password hashing
- 🤖 **Agents** — create user-owned agents/projects, each with its own saved system prompt
- 💬 **Chat** — talk to a selected agent via OpenRouter chat completions
- 📎 **Context files** — upload a small text file and attach its contents to the agent's knowledge
- 🗄️ **Persistence** — Postgres with plain SQL migrations in `backend/migrations`

## 🧱 Tech Stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| **Frontend** | CRA · React 18 · TypeScript                      |
| **Backend**  | Express · TypeScript                             |
| **Database** | PostgreSQL 16                                    |
| **LLM**      | OpenRouter chat completions                     |
| **Tooling**  | npm workspaces · Docker Compose                 |

## 📁 Project Structure

```
YellowClaw/
├── backend/          # Express + TS API
│   ├── migrations/   # SQL schema migrations (manual)
│   └── src/          # domain, application, infrastructure, http
├── frontend/         # CRA React + TS client
│   └── src/          # features, components, services, hooks
├── docker-compose.yml
└── package.json      # npm workspaces root
```

## 🚀 Quick Start

### Prerequisites

- Node.js **20+**
- An **OpenRouter API key** (for real chat calls)
- Postgres **16** — or just use Docker

### 1. Install & configure

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

```bash
SESSION_SECRET=use-a-long-random-secret
OPENROUTER_API_KEY=sk-or-your-key
OPENROUTER_MODEL=openai/gpt-4.1-mini
DATABASE_URL=postgresql://yellowclaw:yellowclaw@localhost:5432/yellowclaw
```

### 2. Run the database migrations

```bash
docker compose run --rm migrate
```

> Migrations are **manual on purpose** — backend startup never auto-applies schema changes.

### 3. Start the app

<details open>
<summary><b>🐳 With Docker (recommended)</b></summary>

```bash
docker compose up --build
```

| Service    | URL                            |
| ---------- | ------------------------------ |
| Frontend   | http://localhost:3000          |
| Backend    | http://localhost:4000          |
| Postgres   | internal Docker network + named volume |

`docker-compose.yml` already wires `DATABASE_URL` for the backend. `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` are read from your shell or `.env`.

</details>

<details>
<summary><b>💻 Local dev (frontend + backend with hot reload)</b></summary>

```bash
npm run dev
```

Runs the backend and frontend together via `concurrently`. You'll need a reachable Postgres in `DATABASE_URL`.

</details>

## 🛠️ Scripts

Run from the repo root:

| Command           | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Start backend + frontend with hot reload             |
| `npm run check`   | Type-check both workspaces (`tsc --noEmit`)          |
| `npm run build`   | Compile the Express server and the CRA app           |
| `npm run migrate` | Build the backend and apply SQL migrations           |
| `npm run start`   | Serve the compiled CRA build from Express            |

## 🌍 Environment Variables

| Variable             | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `SESSION_SECRET`     | Long random string used to sign session cookies      |
| `OPENROUTER_API_KEY` | API key for OpenRouter chat completions              |
| `OPENROUTER_MODEL`   | Model slug, e.g. `openai/gpt-4.1-mini`               |
| `DATABASE_URL`       | Postgres connection string                           |
| `CORS_ORIGIN`        | Allowed frontend origin(s), comma-separated _(backend, optional — defaults to `http://localhost:3000`)_ |

## 🚢 Production Notes

- `npm run build` compiles the Express server and CRA app; `npm run start` serves the CRA build from Express.
- Set `SESSION_SECRET`, `OPENROUTER_API_KEY`, and optionally `OPENROUTER_MODEL` in the backend environment.
- For containers, use [`docker-compose.yml`](./docker-compose.yml).
- For real traffic, move Postgres credentials into secrets management and replace the placeholder session secret.

---

<div align="center">
<sub>Built with React, Express, and Postgres.</sub>
</div>
