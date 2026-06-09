# YellowClaw

YellowClaw is a minimal chatbot platform website. It uses a CRA React TypeScript frontend, an Express TypeScript backend, and Postgres for persistence. The app supports email/password registration, login, user-owned agents, saved system prompts, chat through OpenRouter, and small text-file uploads that are stored in Postgres and attached to the agent context.

## Requirements

- Node.js 20 or newer
- npm workspaces
- Postgres if you run outside Docker
- OpenRouter API key for real chat calls

## Setup

```bash
npm install
cp .env.example .env
```

Fill in:

```bash
SESSION_SECRET=use-a-long-random-secret
OPENROUTER_API_KEY=sk-or-your-key
OPENROUTER_MODEL=openai/gpt-4.1-mini
DATABASE_URL=postgresql://yellowclaw:yellowclaw@localhost:5432/yellowclaw
```

## 1. Run Migrations

Local Docker:

```bash
docker compose run --rm migrate
```

Migrations are manual on purpose. Backend startup does not auto-apply schema changes.

## 2. Run With Docker

```bash
docker compose up --build
```

This starts:

- `frontend` on `http://localhost:3000`
- `backend` on `http://localhost:4000`
- `postgres` on the internal Docker network with a named volume

`docker-compose.yml` already wires `DATABASE_URL` for the backend container. `OPENROUTER_API_KEY` and optional `OPENROUTER_MODEL` are read from your shell or `.env`.

## Features

- Register and login with email/password
- Session cookie with HttpOnly and SameSite protections
- Password hashing with Node `scrypt`
- Create agents/projects per user
- Save an agent name and system prompt
- Chat with a selected agent through OpenRouter chat completions
- Upload a text-like file and attach its contents to the agent knowledge context
- Postgres persistence with SQL migrations in `backend/migrations`

## Useful Scripts

```bash
npm run check
npm run build
npm run migrate
npm run start
```

## Production Notes

For a hosted demo, set `SESSION_SECRET`, `OPENROUTER_API_KEY`, and optionally `OPENROUTER_MODEL` in the backend environment. `npm run build` compiles the Express server and CRA app. `npm run start` serves the compiled CRA build from Express.

For containers, use [docker-compose.yml](/Users/althoframdhan/Documents/YellowClaw/docker-compose.yml). For production traffic, move the Postgres credentials to secrets management and replace the placeholder session secret.
