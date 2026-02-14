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

### 4. Third-Party APIs (REFERENCE ONLY)
- `epsteinemails.xyz` — structured JSON API, $0.001/request via crypto micropayments (x402 protocol)
- `epstein.rizzn.net` — REST API with search, OCR text, pagination
- `epsteingraph.com` — 1.3M documents indexed with network graphs
- These are useful for cross-referencing but shouldn't be a primary dependency

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

---

## Agent Prompt

Use this prompt to execute the plan:

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

- [ ] `threadId` column added to schema
- [ ] `src/db/ingest.ts` created and working
- [ ] `db:ingest` script added to package.json
- [ ] 16K+ real messages ingested into Neon
- [ ] Search upgraded from ILIKE to full-text search
- [ ] API returns real email data
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm build` passes
- [ ] Old seed data removed or archived
