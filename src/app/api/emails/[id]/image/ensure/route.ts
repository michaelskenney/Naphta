import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { db } from "@/db";
import { emails, emailImages, imageJobs } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { toImageState } from "@/lib/image-state";
import { processImageJob } from "@/lib/image-job-runner";
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
    const status = existing[0].status;

    // If stored/moderated, return final state — no work needed
    if (status === "stored" || status === "moderated") {
      const body: ImageStatusResponse = {
        emailId: id,
        state: toImageState(status),
        imageUrl: existing[0].blobUrl,
        errorReason: null,
      };
      return NextResponse.json(body);
    }

    // If queued/failed, re-enqueue a new job to retry processing
    if (status === "queued" || status === "failed") {
      await db
        .update(emailImages)
        .set({ status: "queued", updatedAt: new Date() })
        .where(eq(emailImages.emailId, id));

      const [job] = await db
        .insert(imageJobs)
        .values({ emailId: id })
        .returning({ id: imageJobs.id });

      if (job) {
        after(async () => {
          try {
            await processImageJob(job.id);
          } catch (err) {
            console.error(
              `Background image job ${job.id} failed:`,
              err,
            );
          }
        });
      }
    }

    // generating/queued — just report pending
    const body: ImageStatusResponse = {
      emailId: id,
      state: "pending",
      imageUrl: null,
      errorReason: null,
    };
    return NextResponse.json(body);
  }

  // No record — idempotent claim: INSERT ... ON CONFLICT DO NOTHING
  await db.execute(
    sql`INSERT INTO email_images (email_id, status, created_at, updated_at)
        VALUES (${id}, 'queued', now(), now())
        ON CONFLICT (email_id) DO NOTHING`,
  );

  const [job] = await db
    .insert(imageJobs)
    .values({ emailId: id })
    .returning({ id: imageJobs.id });

  // Process the job after the response is sent
  if (job) {
    after(async () => {
      try {
        await processImageJob(job.id);
      } catch (err) {
        console.error(
          `Background image job ${job.id} failed:`,
          err,
        );
      }
    });
  }

  const body: ImageStatusResponse = {
    emailId: id,
    state: "pending",
    imageUrl: null,
    errorReason: null,
  };

  return NextResponse.json(body, { status: 201 });
}
