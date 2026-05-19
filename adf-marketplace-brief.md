# ADF Marketplace — Project Brief

## Overview

Build an MVP web marketplace where developers can upload, browse, and download `.adf` (Agent Definition Format) files. Think "Hugging Face but for Rawl agents." This will eventually be linked from rawl.ai as a companion resource for the Rawl ecosystem.

## Reference Links

- ADF DeepWiki (full documentation): https://deepwiki.com/christianbalevski/adf
- ADF GitHub repo: https://github.com/christianbalevski/adf
- Rawl.ai (parent project, UI reference): https://rawl.ai

---

## ADF Format — Critical Context

A `.adf` file is a **SQLite database** (not JSON or text). It follows a protected schema where all system tables are prefixed with `adf_`. The key tables are:

| Table | Purpose |
|---|---|
| `adf_meta` | Format metadata and versioning |
| `adf_config` | Agent configuration as a `config_json` blob |
| `adf_loop` | Conversation history |
| `adf_files` | Virtual filesystem — includes `document.md` and `mind.md` |
| `adf_inbox` / `adf_outbox` | ALF message queues |
| `adf_identity` | Encrypted key storage |
| `adf_timers` | Scheduled wake events |
| `adf_tasks` | Async tool execution |
| `adf_audit` | Compressed history archives |
| `adf_logs` | Structured operational logs |

**`document.md`** — stored in `adf_files` at path `document.md` — is the agent's public-facing description. This is what gets displayed on the marketplace listing page. Extract it on upload; do not ask the user to write a separate description.

**`adf_config`** contains a `config_json` blob with the agent's name, enabled tools, trigger configuration, and serving settings. Extract name and tools list from here on upload.

Use Python's built-in `sqlite3` module for all `.adf` parsing.

---

## Tech Stack

- **Backend:** FastAPI (Python)
- **Frontend:** React + Tailwind CSS
- **Database:** PostgreSQL
- **File Storage:** S3 (or local storage for dev)
- **Auth:** GitHub OAuth only (no email/password)

---

## MVP Features

### Auth
- GitHub OAuth login/logout
- Pull GitHub username, display name, and avatar to populate user profile
- JWT-based session management

### Upload
- Authenticated users can upload `.adf` files
- **Validation:** Open the uploaded file as SQLite and confirm the required `adf_` tables exist (`adf_meta`, `adf_config`, `adf_files`, etc.). Reject anything that doesn't conform.
- **Auto-extract from the file on upload (do not ask the user to fill these in manually):**
  - Agent name — from `adf_config.config_json`
  - Description / readme — from `adf_files` where `path = 'document.md'`
  - Tools list — from `adf_config.config_json`
- **User fills in manually (cannot be inferred from file):**
  - Tags (comma-separated)
  - Compatible LLMs (e.g. GPT-4, Claude, Gemini)
  - Use case category (predefined list — see Notes)
- Store file in S3, store extracted + user-provided metadata in PostgreSQL

### Browse & Discovery
- Public listing page — no auth required to browse or download
- Search by name, tags, category
- Sort by: most downloaded, newest, most starred
- Agent card showing: name, description, author, download count, star count, tags

### Agent Detail Page
- Render `document.md` content as markdown — this is the agent's primary description
- Tools list extracted from `adf_config`
- Download button (increments download count)
- Star/bookmark button (requires auth)
- Uploader profile link

### User Profile Page
- List of agents uploaded by that user
- GitHub avatar and username

---

## Data Models (rough)

```
User
- id
- github_id
- username
- display_name
- avatar_url
- created_at

Agent
- id
- uploader_id (FK -> User)
- name (extracted from adf_config)
- document_md (extracted from adf_files where path = 'document.md')
- tools (array, extracted from adf_config)
- tags (array, user-provided)
- compatible_llms (array, user-provided)
- category (user-provided, predefined enum)
- file_path (S3 key)
- download_count
- star_count
- created_at
- updated_at

Star
- user_id (FK -> User)
- agent_id (FK -> Agent)
- created_at
```

---

## Notes

- UI should match the look and feel of https://rawl.ai/ — reference that site for design direction
- Prioritize search/browse experience
- No versioning needed for MVP, one file per agent listing
- The search endpoint should support filtering by category and tags, not just full-text; use PostgreSQL full-text search on `document_md` and `name`
- **Predefined categories (hardcode these, do not let users free-type):** Coding, Research, Productivity, Customer Support, Data Analysis, Creative, DevOps, Finance, Education, Other
- A future addition will be an on-site AI agent to help users find the right agent using semantic search over `document_md` content — use the Anthropic API when that gets built. Do not implement now, but don't make it hard to add later (avoid tight coupling in the search layer)
