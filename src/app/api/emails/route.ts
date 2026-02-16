import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emails, emailImages } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { toImageState } from "@/lib/image-state";
import type { EmailListItem, EmailSearchResponse } from "@/lib/types";

const MAX_PAGE_SIZE = 100;

function buildSearchClause(query: string) {
  const tsQuery = query
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => term.replace(/[^\w]/g, ""))
    .filter(Boolean)
    .join(" & ");
  if (!tsQuery) return undefined;
  return sql`to_tsvector('english', coalesce(${emails.subject}, '') || ' ' || coalesce(${emails.sender}, '') || ' ' || coalesce(${emails.bodyText}, '')) @@ to_tsquery('english', ${tsQuery})`;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get("query")?.trim() ?? "";
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number(params.get("pageSize") ?? 20)),
  );
  const offset = (page - 1) * pageSize;

  const whereClause = query ? buildSearchClause(query) : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: emails.id,
        subject: emails.subject,
        sender: emails.sender,
        recipients: emails.recipients,
        sentAt: emails.sentAt,
        imageStatus: emailImages.status,
      })
      .from(emails)
      .leftJoin(emailImages, eq(emails.id, emailImages.emailId))
      .where(whereClause)
      .orderBy(sql`${emails.sentAt} DESC NULLS LAST`)
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(emails)
      .where(whereClause),
  ]);

  const items: EmailListItem[] = rows.map((row) => ({
    id: row.id,
    subject: row.subject,
    sender: row.sender,
    recipients: row.recipients,
    sentAt: row.sentAt?.toISOString() ?? null,
    imageState: toImageState(row.imageStatus),
  }));

  const body: EmailSearchResponse = {
    emails: items,
    total: Number(countResult[0]?.count ?? 0),
    page,
    pageSize,
  };

  return NextResponse.json(body);
}
