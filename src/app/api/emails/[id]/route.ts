import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emails, emailImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { toImageState } from "@/lib/image-state";
import type { EmailDetail } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const rows = await db
    .select({
      id: emails.id,
      subject: emails.subject,
      sender: emails.sender,
      recipients: emails.recipients,
      sentAt: emails.sentAt,
      bodyText: emails.bodyText,
      bodyHtml: emails.bodyHtml,
      imageStatus: emailImages.status,
      imageUrl: emailImages.blobUrl,
    })
    .from(emails)
    .leftJoin(emailImages, eq(emails.id, emailImages.emailId))
    .where(eq(emails.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return NextResponse.json(
      { error: "Email not found" },
      { status: 404 },
    );
  }

  const body: EmailDetail = {
    id: row.id,
    subject: row.subject,
    sender: row.sender,
    recipients: row.recipients,
    sentAt: row.sentAt?.toISOString() ?? null,
    bodyText: row.bodyText,
    bodyHtml: row.bodyHtml,
    imageState: toImageState(row.imageStatus),
    imageUrl: row.imageUrl,
  };

  return NextResponse.json(body);
}
