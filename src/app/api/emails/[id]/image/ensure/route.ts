import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emails, emailImages, imageJobs } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { toImageState } from "@/lib/image-state";
import type { ImageStatusResponse } from "@/lib/types";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Verify the email exists
  const emailRow = await db
    .select({ id: emails.id })
    .from(emails)
    .where(eq(emails.id, id))
    .limit(1);

  if (!emailRow[0]) {
    return NextResponse.json(
      { error: "Email not found" },
      { status: 404 },
    );
  }

  // Check existing image record
  const existing = await db
    .select({ status: emailImages.status, blobUrl: emailImages.blobUrl })
    .from(emailImages)
    .where(eq(emailImages.emailId, id))
    .limit(1);

  if (existing[0]) {
    const body: ImageStatusResponse = {
      emailId: id,
      state: toImageState(existing[0].status),
      imageUrl: existing[0].blobUrl,
    };
    return NextResponse.json(body);
  }

  // Idempotent claim: INSERT ... ON CONFLICT DO NOTHING
  await db.execute(
    sql`INSERT INTO email_images (email_id, status, created_at, updated_at)
        VALUES (${id}, 'queued', now(), now())
        ON CONFLICT (email_id) DO NOTHING`,
  );

  await db.insert(imageJobs).values({ emailId: id });

  const body: ImageStatusResponse = {
    emailId: id,
    state: "pending",
    imageUrl: null,
  };

  return NextResponse.json(body, { status: 201 });
}
