import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { toImageState } from "@/lib/image-state";
import type { ImageStatusResponse } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const rows = await db
    .select({ status: emailImages.status, blobUrl: emailImages.blobUrl })
    .from(emailImages)
    .where(eq(emailImages.emailId, id))
    .limit(1);

  const row = rows[0];
  const body: ImageStatusResponse = {
    emailId: id,
    state: toImageState(row?.status),
    imageUrl: row?.blobUrl ?? null,
  };

  return NextResponse.json(body);
}
