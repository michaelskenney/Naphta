import { eq, and, lte, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import {
  emails,
  emailImages,
  imageJobs,
  generationEvents,
} from "@/db/schema";
import { generateAndStoreImage } from "@/lib/image-generator";

/** Process a single image generation job by ID. */
export async function processImageJob(
  jobId: number,
): Promise<void> {
  const [job] = await db
    .select()
    .from(imageJobs)
    .where(eq(imageJobs.id, jobId))
    .limit(1);

  if (!job) {
    console.error(`Job ${jobId} not found`);
    return;
  }

  const [email] = await db
    .select()
    .from(emails)
    .where(eq(emails.id, job.emailId))
    .limit(1);

  if (!email) {
    console.error(`Email ${job.emailId} not found for job ${jobId}`);
    await markJobFailed(jobId, job.emailId, "Email not found");
    return;
  }

  // Transition to generating
  await db
    .update(imageJobs)
    .set({
      state: "generating",
      attemptCount: job.attemptCount + 1,
      updatedAt: new Date(),
    })
    .where(eq(imageJobs.id, jobId));

  await logEvent(job.emailId, "generation_started", {
    jobId,
    attempt: job.attemptCount + 1,
  });

  try {
    const result = await generateAndStoreImage(
      job.emailId,
      email.subject,
      email.bodyText,
    );
    await onJobSuccess(jobId, job.emailId, result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : String(err);
    console.error(`Image generation failed for job ${jobId}:`, message);
    await markJobFailed(jobId, job.emailId, message);
  }
}

async function onJobSuccess(
  jobId: number,
  emailId: string,
  result: { blobUrl: string; prompt: string },
): Promise<void> {
  await db
    .update(imageJobs)
    .set({ state: "stored", updatedAt: new Date() })
    .where(eq(imageJobs.id, jobId));

  await db
    .insert(emailImages)
    .values({
      emailId,
      blobUrl: result.blobUrl,
      blobPath: null,
      promptUsed: result.prompt,
      model: process.env.GEMINI_API_KEY
        ? "gemini-2.5-flash-image"
        : "placeholder",
      status: "stored",
    })
    .onConflictDoNothing();

  // If row already existed, update it
  await db
    .update(emailImages)
    .set({
      blobUrl: result.blobUrl,
      blobPath: null,
      promptUsed: result.prompt,
      model: process.env.GEMINI_API_KEY
        ? "gemini-2.5-flash-image"
        : "placeholder",
      status: "stored",
      errorReason: null,
      updatedAt: new Date(),
    })
    .where(eq(emailImages.emailId, emailId));

  await logEvent(emailId, "generation_stored", {
    jobId,
    blobUrl: result.blobUrl,
  });
}

async function markJobFailed(
  jobId: number,
  emailId: string,
  error: string,
): Promise<void> {
  await db
    .update(imageJobs)
    .set({
      state: "failed",
      lastError: error,
      updatedAt: new Date(),
    })
    .where(eq(imageJobs.id, jobId));

  await db
    .insert(emailImages)
    .values({ emailId, status: "failed", errorReason: error })
    .onConflictDoNothing();

  await db
    .update(emailImages)
    .set({
      status: "failed",
      errorReason: error,
      updatedAt: new Date(),
    })
    .where(eq(emailImages.emailId, emailId));

  await logEvent(emailId, "generation_failed", {
    jobId,
    error,
  });
}

/**
 * Find and process pending jobs.
 * Returns the count of jobs processed.
 */
export async function processPendingJobs(
  limit = 5,
): Promise<number> {
  const now = new Date();

  const pendingJobs = await db
    .select()
    .from(imageJobs)
    .where(
      and(
        eq(imageJobs.state, "queued"),
        or(isNull(imageJobs.runAfter), lte(imageJobs.runAfter, now)),
      ),
    )
    .limit(limit);

  for (const job of pendingJobs) {
    await processImageJob(job.id);
  }

  return pendingJobs.length;
}

async function logEvent(
  emailId: string,
  eventType: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await db.insert(generationEvents).values({
    emailId,
    eventType,
    payloadJson: JSON.stringify(payload),
  });
}
