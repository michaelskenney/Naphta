# Epstein Email Explorer + One-Time AI Image Generation

## 1) Product Goal
Build a Vercel-deployed web app that enables fast searching and browsing of the Epstein email corpus (via a proxy to the currently hosted source), and automatically generates **one persisted humorous image per email** using GPT-5.3 the first time that email is viewed.

### Core outcomes
- Users can search/filter/browse emails with low latency.
- Opening an email triggers image generation if no image exists yet.
- Exactly one canonical image is associated with each email ID.
- Generated image is persisted in cloud storage and reused on all future visits.
- App is production-ready on Vercel with observability, guardrails, and rollout plan.

---

## 2) Scope Definition

### In scope (Phase 1)
- Read-only ingestion/proxy from existing email host/source.
- Search + list + detail views for emails.
- First-view image generation pipeline with idempotency.
- Durable persistence of image metadata and binary object.
- Vercel deployment with environment-based config.
- Basic moderation/safety filters for generated prompts.
- Admin/debug endpoints for regeneration audit (no public regenerate by default).

### Out of scope (Phase 1)
- Manual editing of corpus contents.
- User auth/accounts (unless required for abuse controls).
- Multi-image variants per email.
- Fine-grained per-user personalization of image style.

---

## 3) High-Level Architecture

## Runtime stack
- **Frontend**: Next.js App Router on Vercel.
- **Backend/API**: Next.js Route Handlers + Vercel serverless/edge functions.
- **Search**: Start with Postgres full-text (or Vercel Marketplace provider), upgrade path to dedicated search engine if corpus/query complexity demands.
- **Database**: Hosted Postgres (Neon/Supabase/Vercel Postgres).
- **Blob storage**: Vercel Blob for generated image assets.
- **Queue/async orchestration**: Vercel Cron + DB job table (or Inngest/Upstash QStash if needed).
- **AI generation**: GPT-5.3 image endpoint (model/provider finalized during implementation).

## Data flow (email detail open)
1. User requests `/emails/[emailId]`.
2. App fetches email content from normalized local DB cache (or proxy fallback).
3. App checks `email_images` table for `email_id`.
4. If image exists: return stored Blob URL.
5. If not:
   - Attempt atomic claim lock on `email_id`.
   - Winner enqueues or directly runs generation job.
   - Non-winners poll/retry until status resolves.
6. Generator composes safe prompt from email text summary.
7. GPT-5.3 returns image bytes.
8. Bytes stored in Vercel Blob; metadata persisted in DB.
9. Detail page updates to canonical image URL.

## Idempotency & exactly-one-image strategy
- Unique DB constraint: `UNIQUE(email_id)` on `email_images`.
- Job table with state machine (`queued`, `generating`, `stored`, `failed`).
- Advisory lock / `INSERT ... ON CONFLICT` guard.
- At-least-once job execution tolerated via deterministic upsert semantics.
- Optional content hash + ETag to avoid duplicate uploads.

---

## 4) Proposed Data Model

### `emails`
- `id` (PK, stable source ID)
- `source_url`
- `subject`
- `sender`
- `recipients`
- `sent_at`
- `body_text`
- `body_html`
- `search_vector` (fts)
- `created_at`, `updated_at`

### `email_images`
- `email_id` (PK/FK -> `emails.id`)
- `blob_url`
- `blob_path`
- `prompt_used`
- `model`
- `status` (`stored`, `failed`, `moderated`)
- `error_reason` (nullable)
- `created_at`, `updated_at`

### `image_jobs`
- `id` (PK)
- `email_id` (indexed)
- `state`
- `attempt_count`
- `last_error`
- `run_after`
- `created_at`, `updated_at`

### `generation_events` (audit)
- `id` (PK)
- `email_id`
- `event_type`
- `payload_json`
- `created_at`

---

## 5) API Surface (Initial)
- `GET /api/emails?query=&page=&filters=`: searchable listing.
- `GET /api/emails/:id`: detail payload including canonical image state.
- `POST /api/emails/:id/image/ensure`: idempotent trigger endpoint.
- `GET /api/emails/:id/image/status`: polling endpoint.
- `POST /api/admin/images/:id/retry` (admin only).

Response contract includes `imageState` (`ready|pending|failed|moderated`) and `imageUrl` when ready.

---

## 6) UX / Product Behavior

### Browse/search UX
- Search bar + filters (sender, date range, tags if available).
- Fast, keyboard-friendly results list.
- Email detail page with split layout (content + image panel).

### Image UX
- If missing: show “Generating canonical image…” skeleton.
- On failure/moderation: show fallback illustration + message.
- Once stored: always show same canonical image.
- Optional caption: “Generated from this email’s content (first view).”

### Performance targets
- Search response p95 < 400ms (warm path).
- Email detail p95 < 700ms without generation.
- Generation initiated within 1s of first detail load.

---

## 7) Safety, Compliance, and Moderation
- Prompt sanitization pipeline strips sensitive direct identifiers.
- Humor style constraints to avoid defamatory/abusive outputs.
- Output moderation check before publish.
- Store provenance fields (`model`, `prompt_version`, moderation result).
- Add abuse controls/rate limiting on generation trigger endpoint.

---

## 8) Observability & Ops
- Structured logs with correlation IDs (`request_id`, `email_id`, `job_id`).
- Metrics:
  - generation success rate
  - generation latency
  - cache hit rate for existing images
  - failed/moderated counts
- Alerts for job backlog growth and repeated generation failures.
- Dashboard for queue depth and recent events.

---

## 9) Vercel Deployment Plan
1. Create Vercel project + env vars for DB, Blob, AI API keys.
2. Configure preview + production environments.
3. Run DB migrations in CI/CD pipeline.
4. Seed initial corpus metadata (or lazy hydrate).
5. Set up cron/worker route for retry handling.
6. Validate end-to-end flow in preview.
7. Promote to production with feature flag for image generation.

---

## 10) Parallel Agent Swarm Plan

## Swarm topology
- **Coordinator Agent (A0)**: tracks progress, enforces interfaces, merges.
- **A1 Data Ingestion/Search**
- **A2 Email Detail/API Contracts**
- **A3 Image Generation Pipeline**
- **A4 Storage + DB + Migrations**
- **A5 Frontend UX + Design System**
- **A6 Observability/QA/Load Testing**
- **A7 DevOps/Vercel/Release**

## Parallel workstreams

### A1: Source Proxy + Indexing
- Implement proxy client to existing email host.
- Normalize corpus records into `emails` table.
- Add search indexing and pagination.
- Deliverable: reliable ingestion module + searchable API.

### A2: API & Contracts
- Define typed response contracts for list/detail/status endpoints.
- Implement idempotent image trigger endpoint behavior.
- Add schema validation and error mapping.
- Deliverable: stable backend contracts for FE and workers.

### A3: GPT-5.3 Image Generation Worker
- Build prompt composer from email content summary.
- Integrate model API and moderation checks.
- Store generation artifacts and metadata.
- Deliverable: deterministic one-image generation execution.

### A4: Persistence & Concurrency Controls
- Create migrations + constraints + lock strategy.
- Implement job states/retries/backoff.
- Ensure exactly-one-image semantics under concurrency.
- Deliverable: robust transactional integrity.

### A5: Frontend Experience
- Build search page, results list, email detail view.
- Add image states (ready/pending/fail/moderated).
- Responsive layout and accessibility pass.
- Deliverable: polished production UI.

### A6: Test + Quality
- Unit tests for prompt safety and idempotency logic.
- Integration tests for first-view generation race conditions.
- Load tests for search + detail endpoints.
- Deliverable: test report + SLO validation.

### A7: Platform & Release
- Vercel project config, env management, CI checks.
- Preview deployment verification and runbook.
- Rollout plan with feature flags and rollback steps.
- Deliverable: production deployment package.

## Dependency graph
- A4 foundational for A2/A3.
- A2 contract-first unlocks A5 UI parallelization.
- A3 depends on A2 + A4.
- A6 starts early with contract tests, expands as features land.
- A7 finalizes after A1–A6 reach release criteria.

---

## 11) Incremental Git Tracking Strategy
- `main` protected; use short-lived feature branches per agent stream.
- Conventional commits with scope, e.g., `feat(api): add email detail contract`.
- Require green CI and at least one review before merge.
- Suggested milestone tagging:
  - `v0.1-search-browse`
  - `v0.2-image-pipeline`
  - `v0.3-prod-hardening`

### Suggested commit cadence
- Daily vertical slices per stream.
- Every merge updates `docs/progress-log.md` with:
  - completed tasks
  - blockers
  - next steps
  - owner

---

## 12) Delivery Milestones

### Milestone 0: Project Skeleton (Day 1)
- Next.js app scaffold, DB connection, baseline UI shell, lint/test setup.

### Milestone 1: Searchable Corpus (Days 2–4)
- Ingestion/proxy + searchable list/detail UI.

### Milestone 2: One-Time Image Generation (Days 4–7)
- Full pipeline with idempotent locking and Blob persistence.

### Milestone 3: Hardening (Days 7–9)
- Moderation, retries, observability, performance tuning.

### Milestone 4: Launch Prep (Days 10–11)
- Vercel production deploy, feature-flag rollout, runbook handoff.

---

## 13) Risk Register + Mitigations
- **Source instability/format drift** → robust adapter + schema validation + caching.
- **Generation cost spikes** → one-image-only invariant + retries with cap.
- **Concurrency duplicates** → DB uniqueness + lock + upsert semantics.
- **Moderation false positives** → explicit fallback image path + admin retry queue.
- **Slow search at scale** → indexed query plan + optional dedicated search backend.

---

## 14) Open Questions Requiring Product Decisions
1. What visual style should the generated humor images follow (comic, photoreal, caricature, surreal collage)?
2. Should generated images be visible to everyone immediately, or hidden until moderation checks pass?
3. Do you want explicit content disclaimers/watermarks on generated images?
4. Is anonymous access allowed, or do we need lightweight auth/rate limits from day one?
5. Which source dataset endpoints are stable and officially allowed for proxying/caching?
6. Should we support “report image” feedback on launch?
7. Do you want a dark mode and any specific brand/style direction?
8. Do you want image generation to run synchronously on first view (slower first load) or asynchronously with live status updates?
9. Are there geographic/legal constraints for where data and generated media may be stored?
10. What initial budget guardrails do you want for model inference and storage?

---

## 15) Definition of Ready for Build Start
- Product decisions on open questions above.
- Approved architecture and milestone timeline.
- Confirmed model endpoint for GPT-5.3 image generation.
- Vercel/DB/Blob account availability and deployment ownership.

