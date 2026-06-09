# Architecture

## Overview

YellowClaw is split into two TypeScript workspaces:

- `frontend`: CRA React TypeScript app for the website UI.
- `backend`: Express TypeScript API for auth, persistence, and OpenRouter calls.
- `postgres`: relational persistence for users, sessions, projects, messages, and uploaded knowledge files.

This keeps browser code separate from server-only concerns like `OPENROUTER_API_KEY`, while keeping the demo easy to run.

## Components

- `backend/src/server.ts`: Express setup, JSON parsing, cookie parsing, production static serving, and error handling.
- `backend/src/domain`: shared business types and application errors.
- `backend/src/application`: use cases for auth, projects, chat, files, validation, and response serialization.
- `backend/src/infrastructure/auth`: password hashing, session token signing, cookie helpers, and current-user lookup.
- `backend/src/infrastructure/database`: Postgres connection setup.
- `backend/src/infrastructure/repositories`: Postgres repository queries and transactions.
- `backend/src/infrastructure/llm`: OpenRouter chat integration.
- `backend/src/interfaces/http`: Express routes, request typing, and auth middleware.
- `backend/src/migrate.ts`: migration runner that records applied SQL files in `_schema_migrations`.
- `backend/migrations/*.sql`: ordered schema changes for Postgres.
- `frontend/src/App.tsx`: thin React composition entrypoint.
- `frontend/src/hooks`: screen orchestration and client-side workflow state.
- `frontend/src/services`: typed API calls grouped by backend capability.
- `frontend/src/features`: auth and workspace UI surfaces.
- `frontend/src/components`: small shared UI components.
- `frontend/src/shared`: frontend-only types and utilities.
- `frontend/src/App.css`: responsive product UI styling.
- `docker-compose.yml`: orchestration for frontend, backend, and Postgres.

## Data Model

- `users`: account id, email, display name, password hash, created timestamp.
- `sessions`: hashed session token, user id, expiry.
- `projects`: user-owned agent id, name, system prompt, timestamps.
- `messages`: project id, role, content, timestamp.
- `files`: project id, optional provider file id, original filename, stored text content, timestamp.

## Auth Flow

Users register or login with email and password through the Express API. Passwords are hashed with `scrypt`. Successful auth creates a random session token, stores only its SHA-256 hash in Postgres, signs the browser cookie with HMAC, and sends it as HttpOnly and SameSite.

## Chat Flow

The React app posts a message to `/api/projects/:id/chat`. The Express server verifies project ownership, loads the latest conversation context plus uploaded knowledge files, sends the saved project prompt and recent messages to OpenRouter, stores the user and assistant messages, then returns the new pair to the frontend.

## File Upload Flow

The React app reads a selected text-like file and posts filename plus content to `/api/projects/:id/files`. The Express server stores the file text in Postgres so every future chat can reuse it as agent context without depending on provider-specific file APIs.

## Scalability Path

The app now uses Postgres and can handle concurrent reads and writes more safely than the earlier file-based version. To push further, add pooled connection tuning, background cleanup for expired sessions, streaming chat responses, and richer migration workflows such as rollback support or drift checks.

## Security Notes

- Passwords are never stored in plaintext.
- Session cookies are HttpOnly and signed.
- Every project, message, and file endpoint checks ownership.
- API keys are read only from server environment variables.
- The OpenRouter key is never exposed to browser JavaScript.
