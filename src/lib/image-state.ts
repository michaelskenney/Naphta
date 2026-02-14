import type { ImageState } from "@/lib/types";

const STATUS_TO_STATE: Record<string, ImageState> = {
  stored: "ready",
  queued: "pending",
  generating: "pending",
  failed: "failed",
  moderated: "moderated",
};

/** Map a DB email_images.status value to the API-facing ImageState. */
export function toImageState(
  status: string | null | undefined,
): ImageState {
  if (!status) return "none";
  return STATUS_TO_STATE[status] ?? "none";
}
