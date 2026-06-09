# Architecture

## Overview

YellowClaw is split into two TypeScript workspaces plus a database, keeping browser
code separate from server-only concerns like `OPENROUTER_API_KEY` while staying easy to run.

- **`frontend`** — CRA React TypeScript app for the website UI.
- **`backend`** — Express TypeScript API for auth, persistence, and OpenRouter calls.
- **`postgres`** — relational persistence for users, sessions, projects, messages, and uploaded knowledge files.

```mermaid
flowchart LR
    User([User / Browser])

    subgraph Frontend["frontend · CRA React + TS"]
        UI[Features & Components]
        Services[API Services]
    end

    subgraph Backend["backend · Express + TS"]
        Routes[HTTP Routes + Auth Middleware]
        UseCases[Application Use Cases]
        Repos[Repositories]
        LLM[OpenRouter Client]
    end

    DB[(Postgres)]
    OpenRouter([OpenRouter API])

    User --> UI --> Services
    Services -- "JSON / cookie" --> Routes
    Routes --> UseCases
    UseCases --> Repos --> DB
    UseCases --> LLM --> OpenRouter
```

## Components

### Backend

| Path | Responsibility |
| ---- | -------------- |
| `src/server.ts` | Express setup, JSON & cookie parsing, CORS, production static serving, error handling |
| `src/domain` | Shared business types and application errors |
| `src/application` | Use cases for auth, projects, chat, files, validation, and serialization |
| `src/infrastructure/auth` | Password hashing, session token signing, cookie helpers, current-user lookup |
| `src/infrastructure/database` | Postgres connection setup |
| `src/infrastructure/repositories` | Postgres repository queries and transactions |
| `src/infrastructure/llm` | OpenRouter chat integration |
| `src/interfaces/http` | Express routes, request typing, auth middleware |
| `src/migrate.ts` | Migration runner; records applied SQL files in `_schema_migrations` |
| `migrations/*.sql` | Ordered schema changes for Postgres |

### Frontend

| Path | Responsibility |
| ---- | -------------- |
| `src/App.tsx` | Thin React composition entrypoint |
| `src/hooks` | Screen orchestration and client-side workflow state |
| `src/services` | Typed API calls grouped by backend capability |
| `src/features` | Auth and workspace UI surfaces |
| `src/components` | Small shared UI components |
| `src/shared` | Frontend-only types and utilities |
| `src/App.css` | Responsive product UI styling |

### Orchestration

| Path | Responsibility |
| ---- | -------------- |
| `docker-compose.yml` | Orchestration for frontend, backend, and Postgres |

## Data Model

```mermaid
erDiagram
    users ||--o{ sessions : "has"
    users ||--o{ projects : "owns"
    projects ||--o{ messages : "contains"
    projects ||--o{ files : "attaches"

    users {
        uuid id PK
        text email
        text name
        text password_hash
        timestamp created_at
    }
    sessions {
        text token_hash PK
        uuid user_id FK
        timestamp expires_at
    }
    projects {
        uuid id PK
        uuid user_id FK
        text name
        text system_prompt
        timestamp created_at
    }
    messages {
        uuid id PK
        uuid project_id FK
        text role
        text content
        timestamp created_at
    }
    files {
        uuid id PK
        uuid project_id FK
        text provider_file_id
        text filename
        text content
        timestamp created_at
    }
```

## Auth Flow

Passwords are hashed with `scrypt`. A successful login creates a random session token,
stores only its SHA-256 hash in Postgres, signs the browser cookie with HMAC, and sends
it as HttpOnly + SameSite.

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend
    participant API as Express API
    participant DB as Postgres

    U->>FE: Submit email + password
    FE->>API: POST /api/auth/login
    API->>DB: Look up user by email
    API->>API: Verify password (scrypt)
    API->>DB: Store SHA-256(session token)
    API-->>FE: Set-Cookie (HttpOnly, SameSite, HMAC-signed)
    FE-->>U: Authenticated workspace
```

## Chat Flow

The React app posts a message to `/api/projects/:id/chat`. The server verifies ownership,
loads recent context plus uploaded knowledge files, calls OpenRouter with the saved prompt,
persists both messages, and returns the new pair.

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend
    participant API as Express API
    participant DB as Postgres
    participant OR as OpenRouter

    U->>FE: Send message
    FE->>API: POST /api/projects/:id/chat
    API->>DB: Verify ownership + load context & files
    API->>OR: System prompt + recent messages
    OR-->>API: Assistant reply
    API->>DB: Store user + assistant messages
    API-->>FE: New message pair
    FE-->>U: Render reply
```

## File Upload Flow

The React app reads a selected text-like file and posts filename plus content to
`/api/projects/:id/files`. The server stores the file text in Postgres so every future
chat can reuse it as agent context — no dependency on provider-specific file APIs.

## Scalability Path

Postgres handles concurrent reads and writes more safely than the earlier file-based
version. To push further: pooled connection tuning, background cleanup for expired
sessions, streaming chat responses, and richer migration workflows such as rollback
support or drift checks.

## Security Notes

- 🔒 Passwords are never stored in plaintext.
- 🍪 Session cookies are HttpOnly and signed.
- 👤 Every project, message, and file endpoint checks ownership.
- 🔑 API keys are read only from server environment variables.
- 🚫 The OpenRouter key is never exposed to browser JavaScript.
