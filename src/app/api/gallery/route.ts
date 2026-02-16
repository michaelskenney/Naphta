import { NextResponse } from "next/server";
import { db } from "@/db";
import { emails, emailImages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { GalleryItem, GalleryResponse } from "@/lib/types";

export async function GET() {
  const rows = await db
    .select({
      emailId: emailImages.emailId,
      subject: emails.subject,
      sender: emails.sender,
      sentAt: emails.sentAt,
      imageUrl: emailImages.blobUrl,
      promptUsed: emailImages.promptUsed,
      model: emailImages.model,
      generatedAt: emailImages.createdAt,
    })
    .from(emailImages)
    .innerJoin(emails, eq(emailImages.emailId, emails.id))
    .where(eq(emailImages.status, "stored"))
    .orderBy(desc(emailImages.createdAt));

  const images: GalleryItem[] = rows.map((row) => ({
    emailId: row.emailId,
    subject: row.subject,
    sender: row.sender,
    sentAt: row.sentAt?.toISOString() ?? null,
    imageUrl: row.imageUrl,
    promptUsed: row.promptUsed,
    model: row.model,
    generatedAt: row.generatedAt?.toISOString() ?? null,
  }));

  const body: GalleryResponse = {
    images,
    total: images.length,
  };

  return NextResponse.json(body);
}
