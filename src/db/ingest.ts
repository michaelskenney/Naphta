import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import { emails } from "@/db/schema";

const HF_API =
  "https://datasets-server.huggingface.co/rows" +
  "?dataset=notesbymuneeb/epstein-emails&config=default&split=train";
const PAGE_SIZE = 100;

interface HfMessage {
  sender: string;
  recipients: string[];
  timestamp: string;
  subject: string;
  body: string;
}

interface HfRow {
  thread_id: string;
  source_file: string;
  subject: string;
  messages: string;
  message_count: number;
}

interface HfResponse {
  rows: { row_idx: number; row: HfRow }[];
  num_rows_total: number;
}

function parseTimestamp(raw: string): Date | null {
  if (!raw) return null;

  // Strip Gmail-style "at" separators: "Jan 9, 2015 at 1:20 PM"
  const cleaned = raw.replace(/,?\s+at\s+/i, " ").trim();

  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d;

  // Handle "5/30/2019 5:29 PM" or "5/30/2019 9:34:38 PM" style
  const usDate = cleaned.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i,
  );
  if (usDate) {
    const [, month, day, year, hours, minutes, , ampm] = usDate;
    let h = parseInt(hours!, 10);
    if (ampm?.toUpperCase() === "PM" && h < 12) h += 12;
    if (ampm?.toUpperCase() === "AM" && h === 12) h = 0;
    return new Date(
      parseInt(year!, 10),
      parseInt(month!, 10) - 1,
      parseInt(day!, 10),
      h,
      parseInt(minutes!, 10),
    );
  }

  return null;
}

function makeEmailId(threadId: string, msgIndex: number): string {
  return `${threadId}_msg_${msgIndex}`;
}

async function fetchPage(offset: number): Promise<HfResponse> {
  const url = `${HF_API}&offset=${offset}&length=${PAGE_SIZE}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `HuggingFace API error: ${res.status} ${res.statusText}`,
    );
  }
  return (await res.json()) as HfResponse;
}

function parseMessages(raw: string): HfMessage[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HfMessage[];
  } catch {
    return [];
  }
}

function buildEmailRow(
  threadId: string,
  sourceFile: string,
  threadSubject: string,
  msg: HfMessage,
  msgIndex: number,
) {
  return {
    id: makeEmailId(threadId, msgIndex),
    threadId,
    sourceUrl: `huggingface://notesbymuneeb/epstein-emails/${sourceFile}`,
    subject: msg.subject || threadSubject || null,
    sender: msg.sender || null,
    recipients: msg.recipients?.join(", ") || null,
    sentAt: parseTimestamp(msg.timestamp),
    bodyText: msg.body || null,
    bodyHtml: null,
  };
}

async function createSearchIndex(db: ReturnType<typeof drizzle>) {
  console.log("Creating full-text search GIN index...");
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS emails_search_idx
    ON emails USING GIN(
      to_tsvector('english',
        coalesce(subject, '') || ' ' ||
        coalesce(sender, '') || ' ' ||
        coalesce(body_text, '')
      )
    )
  `);
  console.log("Search index created.");
}

async function ingest() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Set it in .env.local.");
  }

  const client = neon(url);
  const db = drizzle(client);

  console.log("Fetching dataset metadata...");
  const first = await fetchPage(0);
  const totalThreads = first.num_rows_total;
  console.log(`Total threads in dataset: ${totalThreads}`);

  let totalMessages = 0;
  let threadsProcessed = 0;

  for (let offset = 0; offset < totalThreads; offset += PAGE_SIZE) {
    const page = offset === 0 ? first : await fetchPage(offset);
    const batch: ReturnType<typeof buildEmailRow>[] = [];

    for (const { row } of page.rows) {
      const messages = parseMessages(row.messages);
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i]!;
        batch.push(
          buildEmailRow(row.thread_id, row.source_file, row.subject, msg, i),
        );
      }
      threadsProcessed++;
    }

    if (batch.length > 0) {
      await db.insert(emails).values(batch).onConflictDoNothing();
      totalMessages += batch.length;
    }

    if (threadsProcessed % 100 === 0 || offset + PAGE_SIZE >= totalThreads) {
      console.log(
        `Progress: ${threadsProcessed}/${totalThreads} threads, ` +
          `${totalMessages} messages inserted`,
      );
    }
  }

  await createSearchIndex(db);

  console.log(
    `\nIngestion complete: ${threadsProcessed} threads, ` +
      `${totalMessages} messages total.`,
  );
}

ingest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Ingestion failed:", err);
    process.exit(1);
  });
