# Plan: Replace Seed Data with Real Epstein Corpus

## Context

The Naphta app currently uses 50 fabricated seed emails in `src/db/seed.ts`. This plan replaces them with real documents from the DOJ Epstein Files release (3.5M pages under the Epstein Files Transparency Act, signed Nov 19, 2025).

The app is a working Next.js prototype with:
- Drizzle ORM schema in `src/db/schema.ts` (emails, email_images, image_jobs, generation_events tables)
- API routes in `src/app/api/emails/` (search, detail, image ensure, image status)
- Frontend in `src/app/emails/` (search page, detail page with image panel)
- Image generation pipeline in `src/lib/` (prompt composer, generator, job runner)
- Neon Postgres database connected via `.env.local` DATABASE_URL

All code builds clean (`pnpm build` passes, `pnpm tsc --noEmit` passes).

---

## Data Sources (Ranked by Usefulness)

### 1. HuggingFace: `notesbymuneeb/epstein-emails` (PRIMARY - emails)
- **5,082 email threads** with 16,447 individual messages
- Already parsed into structured JSON with: `sender`, `recipients`, `subject`, `timestamp`, `body`
- OCR errors corrected, footers removed, quoted text separated
- Source: House Oversight Committee release (Nov 2025)
- Format: Parquet file (`epstein_email_threads.parquet`)
- Download: `https://huggingface.co/datasets/notesbymuneeb/epstein-emails`
- License: Public domain (government documents)

### 2. HuggingFace: `theelderemo/FULL_EPSTEIN_INDEX` (SECONDARY - all documents)
- **8,530 rows** of OCR'd documents (not just emails — includes court records, flight logs, contact books)
- Fields: `id` (filename like EFTA00005586.pdf), `text` (OCR content)
- Source: DOJ + House Oversight + FBI + CBP releases combined
- Format: CSV/Parquet on HuggingFace
- Download: `https://huggingface.co/datasets/theelderemo/FULL_EPSTEIN_INDEX`
- Less structured than source #1 but broader coverage

### 3. DOJ Website Direct (FALLBACK - raw PDFs)
- **3.5M pages** across 12 data sets at `https://www.justice.gov/epstein/doj-disclosures`
- Individual PDFs named `EFTA{8-digit-number}.pdf`
- URL pattern: `https://www.justice.gov/epstein/files/DataSet%201/{filename}.pdf`
- Would require PDF download + OCR + parsing — heavy lift
- Behind Akamai bot protection (search page blocked)

### 4. Third-Party APIs

**VETTED — epsteingraph.com (INVESTIGATE FOR PHASE 3)**
- Built by solo developer (`indienow` on Reddit r/datasets), Next.js + Postgres + D3.js
- **1.3M documents** from DOJ Transparency Act, House Oversight, estate proceedings
- **238K entities** extracted via OpenAI batch API with network graph visualization
- Free, no paywalls, crowdsourced uploads, responsible "co-occurrence ≠ causation" disclaimers
- Potential value: entity extraction data, network graphs, cross-referencing our email corpus
- **Status**: Legit transparency project. API capabilities unknown — needs investigation before integration.
- See "Step 7" below for investigation plan.

**SKIP — epsteinemails.xyz**
- Charges crypto micropayments (x402 protocol) for public domain government documents
- No reason to pay for data freely available from HuggingFace and DOJ

**SKIP — epstein.rizzn.net**
- Insufficient web presence to validate legitimacy

---

## Implementation Plan

### Step 1: Download and parse the HuggingFace email dataset

Create `src/db/ingest.ts` — a CLI script that:

1. Downloads the parquet file from `notesbymuneeb/epstein-emails`
   - Use the HuggingFace datasets API: `https://huggingface.co/api/datasets/notesbymuneeb/epstein-emails/parquet/default/train`
   - Or download via: `https://huggingface.co/datasets/notesbymuneeb/epstein-emails/resolve/main/data/train-00000-of-00001.parquet`
   - Install `parquet-wasm` or `hyparquet` to read parquet in Node.js, OR convert to JSON/CSV first using a Python one-liner and commit the JSON

2. Parses each thread and flattens individual messages into our `emails` schema:
   ```
   For each thread:
     For each message in thread.messages:
       Insert into emails table:
         id: thread.thread_id + "_msg_" + index (or hash)
         subject: message.subject or thread.subject
         sender: message.sender
         recipients: message.recipients.join(", ")
         sentAt: parse(message.timestamp) — handle multiple date formats
         bodyText: message.body
         bodyHtml: null
         sourceUrl: "huggingface://notesbymuneeb/epstein-emails/" + thread.source_file
   ```

3. Uses `INSERT ... ON CONFLICT DO NOTHING` for idempotency

4. Logs progress: "Inserted X of Y messages"

**Dependencies to install**: Consider `hyparquet` (pure JS parquet reader) or just pre-convert to JSON with Python.

**Simpler alternative**: Use the HuggingFace datasets REST API which returns JSON directly:
```
GET https://datasets-server.huggingface.co/rows?dataset=notesbymuneeb/epstein-emails&config=default&split=train&offset=0&length=100
```
This returns JSON rows with no parquet parsing needed. Paginate with offset/length.

### Step 2: Update the DB schema if needed

The current `emails` schema should work as-is. The key fields map:
- `id` → generated from thread_id + message index
- `subject` → message.subject
- `sender` → message.sender
- `recipients` → message.recipients joined
- `sentAt` → message.timestamp parsed
- `bodyText` → message.body
- `sourceUrl` → source_file reference

One potential addition: add a `threadId` column to `emails` to group messages by thread. This would enable a threaded view later.

```sql
ALTER TABLE emails ADD COLUMN thread_id VARCHAR(255);
CREATE INDEX emails_thread_id_idx ON emails(thread_id);
```

Add this to the Drizzle schema in `src/db/schema.ts`:
```typescript
threadId: varchar("thread_id", { length: 255 }),
```

### Step 3: Update the seed script

Replace `src/db/seed.ts` with the new ingestion script, or keep seed.ts as a small dev-only fallback and add:
```json
"db:ingest": "tsx --env-file=.env.local src/db/ingest.ts"
```

### Step 4: Handle date parsing

The dataset has timestamps in various formats. The ingest script needs a robust date parser. Examples from the dataset:
- "Mon, 14 Mar 2005 09:22:00 -0500"
- "March 14, 2005"
- "3/14/2005"
- "2005-03-14T09:22:00Z"

Use `new Date(timestamp)` with a fallback chain, or install `chrono-node` for natural language date parsing.

### Step 5: Update search to handle larger dataset

With 16K+ messages instead of 50, the ILIKE search will be slow. Options:
1. **Quick fix**: Add a GIN index with `pg_trgm` for trigram similarity search
2. **Better**: Add a `tsvector` column and use Postgres full-text search
3. **Best (later)**: Dedicated search engine (Meilisearch, Typesense)

For the prototype, add this to the schema:
```sql
ALTER TABLE emails ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(subject, '') || ' ' || coalesce(body_text, ''))
  ) STORED;
CREATE INDEX emails_search_idx ON emails USING GIN(search_vector);
```

And update `src/app/api/emails/route.ts` to use `@@` operator instead of `ILIKE`.

### Step 6: Optional — Ingest the broader FULL_EPSTEIN_INDEX

After emails are working, optionally ingest the `theelderemo/FULL_EPSTEIN_INDEX` dataset for non-email documents (court records, flight logs, etc). These don't have structured sender/recipient fields, so they'd need:
- A `documentType` field added to the schema (email, court_record, flight_log, etc)
- Different display in the UI for non-email documents

This is a Phase 2 concern.

### Step 7: Investigate epsteingraph.com API (Phase 3)

The epsteingraph.com project indexes 1.3M documents with AI entity extraction and network graphs. Before any integration, we need to understand what API surface (if any) it exposes and whether its data would complement our email corpus.

**Investigation goals:**
1. Determine if epsteingraph.com has a public API (REST, GraphQL, or otherwise)
2. Document available endpoints, rate limits, auth requirements
3. Assess data overlap with our HuggingFace email dataset
4. Evaluate entity/relationship data quality — could we import their 238K extracted entities?
5. Check if their network graph data (D3.js) is exportable or API-accessible
6. Identify what document types they have that we don't (flight logs, court filings, videos, audio)
7. Determine data freshness — do they update as new DOJ releases come out?

**Integration possibilities (if API exists):**
- Cross-reference our email senders/recipients against their entity graph
- Import entity metadata (roles, relationships) to enrich our email records
- Link our emails to related non-email documents (court filings, flight logs)
- Display network connections on email detail pages

**Do NOT integrate until:**
- API stability and reliability are confirmed
- Data licensing/terms are reviewed
- We verify the entity extraction quality against primary sources

---

## Agent Prompt: Investigate epsteingraph.com API

Use this prompt to investigate the epsteingraph.com API:

```
You are working on the Naphta project at /Users/zmoney/src/github.com/michaelskenney/naphta

Naphta is an Epstein email corpus explorer. We have 16,447 real emails ingested from the
HuggingFace `notesbymuneeb/epstein-emails` dataset. We want to evaluate epsteingraph.com
as a potential data source for enriching our corpus.

READ FIRST:
- docs/plan-real-data-ingestion.md (Step 7 — your instructions)
- CLAUDE.md (project conventions)

YOUR JOB IS RESEARCH ONLY — do NOT write any integration code.

TASKS:

1. Investigate epsteingraph.com for API endpoints:
   - Check for /api/* routes, GraphQL endpoints, or documented APIs
   - Look at their GitHub repo if public (creator: indienow on Reddit)
   - Inspect network requests on their site to find undocumented APIs
   - Check robots.txt and sitemap.xml for clues

2. If an API exists, document:
   - Available endpoints and their response shapes
   - Authentication requirements (API key, open, rate-limited?)
   - Pagination patterns
   - Entity data schema (what fields per entity?)
   - Network/relationship data format
   - Rate limits or usage restrictions

3. Assess data quality:
   - Pick 5-10 entities that appear in our email corpus (e.g., known senders)
   - Check if epsteingraph.com has matching entity data
   - Evaluate whether their entity extraction adds value beyond what we have

4. Check for overlap with our dataset:
   - Do they index the same House Oversight email documents?
   - What document types do they have that we lack?
   - Is their OCR/text extraction higher quality than the HuggingFace dataset?

5. Write findings to docs/epsteingraph-api-investigation.md:
   - API capabilities summary
   - Data quality assessment
   - Recommended integration approach (or reasons to skip)
   - Any concerns (stability, data accuracy, terms of use)

IMPORTANT:
- This is a research task — do NOT modify any source code
- Do NOT create database schemas or integration code
- Do NOT make excessive requests to their site — be respectful
- Be skeptical — verify claims against primary sources where possible
```

---

## Agent Prompt: Ingest Real Data (COMPLETED)

Use this prompt to execute the original data ingestion plan:

```
You are working on the Naphta project at /Users/zmoney/src/github.com/michaelskenney/naphta

The app is a working Next.js email explorer with Drizzle ORM, Neon Postgres, and Tailwind CSS.
It currently has 50 fake seed emails. Your job is to replace them with real data from the
Epstein Files release.

READ THESE FILES FIRST to understand the codebase:
- docs/plan-real-data-ingestion.md (this plan — your instructions)
- src/db/schema.ts (current Drizzle schema)
- src/db/index.ts (DB connection)
- src/app/api/emails/route.ts (search API — you'll update this)
- package.json (current deps and scripts)

TASKS:

1. Add a `threadId` column to the emails table in src/db/schema.ts

2. Create src/db/ingest.ts that:
   - Fetches email data from the HuggingFace datasets API:
     GET https://datasets-server.huggingface.co/rows?dataset=notesbymuneeb/epstein-emails&config=default&split=train&offset=0&length=100
   - Paginates through ALL rows (5,082 threads, use offset+length)
   - For each thread, parses the `messages` JSON field
   - Flattens each message into an emails table row
   - Handles varied timestamp formats (use chrono-node or manual parsing)
   - Inserts with ON CONFLICT DO NOTHING for idempotency
   - Logs progress every 100 threads
   - Add "db:ingest" script to package.json

3. Upgrade search from ILIKE to Postgres full-text search:
   - Add a generated tsvector column to the schema (or compute it in the query)
   - Update src/app/api/emails/route.ts to use ts_query/ts_vector
   - This is critical because 16K messages will be too slow with ILIKE

4. Run the ingestion: pnpm db:push && pnpm db:ingest

5. Verify the API works with real data:
   - curl 'http://localhost:3000/api/emails?pageSize=5'
   - curl 'http://localhost:3000/api/emails?query=flight&pageSize=5'
   - Confirm real email content is returned

6. Delete the old fake seed data file (src/db/seed.ts) or rename it to seed.dev.ts

IMPORTANT:
- Do NOT modify the frontend pages or components — only backend/data layer
- Do NOT modify the image generation pipeline
- Use @/ absolute imports, not relative
- Keep functions under 100 lines
- Run pnpm tsc --noEmit to verify types after changes
- The .env.local file already has DATABASE_URL set for Neon
```

---

## Verification Checklist

- [x] `threadId` column added to schema
- [x] `src/db/ingest.ts` created and working
- [x] `db:ingest` script added to package.json
- [x] 16,447 real messages ingested into Neon (97.6% with parsed timestamps)
- [x] Search upgraded from ILIKE to full-text search (expression-based GIN index)
- [x] API returns real email data
- [x] `pnpm tsc --noEmit` passes
- [x] `pnpm build` passes
- [x] Old seed data removed (`seed.ts` deleted)
- [ ] Investigate epsteingraph.com API (Phase 3 — see Step 7)
