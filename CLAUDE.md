# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Naphta** is an Epstein email corpus explorer with automatic one-time AI image generation per email. Users search/browse emails; opening an email triggers GPT-5.3 (or Nano Banana) image generation on first view, with the result persisted and reused on all subsequent visits.

**Status:** Pre-implementation (planning docs only in `docs/`). See `docs/agent-swarm-plan.md` for the full architecture specification.

## Planned Tech Stack

- **Framework:** Next.js App Router (TypeScript, ESM)
- **Hosting:** Vercel (serverless/edge functions)
- **Database:** Hosted Postgres (Neon/Supabase/Vercel Postgres)
- **Search:** Postgres full-text search (upgrade path to dedicated engine)
- **Blob storage:** Vercel Blob for generated images
- **Async jobs:** Vercel Cron + DB job table (or Inngest/QStash)
- **AI:** GPT-5.3 image endpoint
- **Package manager:** pnpm

## Architecture

### Core Data Flow (Email Detail)

1. User requests `/emails/[emailId]`
2. Fetch email from local DB cache (or proxy fallback to source)
3. Check `email_images` for existing image
4. If none: atomic claim lock → enqueue generation → GPT-5.3 → store in Vercel Blob → persist metadata
5. Non-winners of the lock poll until status resolves

### Idempotency (Exactly-One-Image)

- `UNIQUE(email_id)` constraint on `email_images`
- Job state machine: `queued` → `generating` → `stored` | `failed`
- Advisory lock / `INSERT ... ON CONFLICT` guard
- Deterministic upsert semantics for at-least-once execution

### Data Model (4 tables)

- **`emails`** — corpus records with `search_vector` for FTS
- **`email_images`** — one row per email, stores `blob_url`, `prompt_used`, `model`, `status`
- **`image_jobs`** — generation queue with `state`, `attempt_count`, `run_after`
- **`generation_events`** — audit log of all generation activity

### API Surface

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/emails` | GET | Search/filter/paginate emails |
| `/api/emails/:id` | GET | Email detail with `imageState` and `imageUrl` |
| `/api/emails/:id/image/ensure` | POST | Idempotent generation trigger |
| `/api/emails/:id/image/status` | GET | Poll generation progress |
| `/api/admin/images/:id/retry` | POST | Admin-only regeneration |

Response contracts include `imageState`: `ready|pending|failed|moderated`.

## Agent Swarm Structure

The project is designed for parallel development by 7 agent streams:

| Agent | Domain |
|-------|--------|
| A1 | Source proxy + corpus ingestion + search indexing |
| A2 | API contracts + typed responses + validation |
| A3 | GPT-5.3 image generation + prompt composer + moderation |
| A4 | DB migrations + concurrency controls + job states |
| A5 | Frontend UX (search, list, detail, image states) |
| A6 | Testing + QA + load testing |
| A7 | Vercel config + CI/CD + release |

**Dependencies:** A4 is foundational (unlocks A2/A3). A2 contracts unlock A5. A3 depends on A2+A4. A7 finalizes after A1-A6.

## Git Conventions

- **Protected branch:** `main` — no direct pushes
- **Commit style:** Conventional commits with scope — `feat(api): add email detail contract`
- **Branching:** Short-lived feature branches per agent stream
- **Milestone tags:** `v0.1-search-browse`, `v0.2-image-pipeline`, `v0.3-prod-hardening`
- **Progress tracking:** Every merge updates `docs/progress-log.md`

## Performance Targets

- Search response p95 < 400ms (warm path)
- Email detail p95 < 700ms (without generation)
- Generation initiated within 1s of first detail load

## Safety & Moderation

- Prompt sanitization strips sensitive identifiers before generation
- Output moderation check before publishing images
- Provenance tracking: `model`, `prompt_version`, moderation result stored per image
- Rate limiting on generation trigger endpoint
- Fallback illustration shown for failed/moderated images
