"use client";

import { Image, AlertCircle, Loader2 } from "lucide-react";
import type { ImageState } from "@/lib/types";

interface ImagePanelProps {
  state: ImageState;
  imageUrl: string | null;
  errorReason?: string | null;
}

export function ImagePanel({ state, imageUrl, errorReason }: ImagePanelProps) {
  if (state === "ready" && imageUrl) {
    return (
      <div className="overflow-hidden rounded-lg border border-zinc-700">
        <img
          src={imageUrl}
          alt="AI-generated illustration"
          className="h-auto w-full object-cover"
        />
      </div>
    );
  }

  if (state === "pending") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900 p-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-sm text-zinc-400">Generating image...</p>
      </div>
    );
  }

  if (state === "failed" || state === "moderated") {
    const message =
      state === "moderated"
        ? "Image was flagged by moderation"
        : "Image generation failed";
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900 p-12">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-zinc-400">{message}</p>
        {errorReason && (
          <p className="mt-1 max-w-xs rounded bg-zinc-800 px-3 py-2 text-center text-xs leading-relaxed text-zinc-500">
            {errorReason}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 p-12">
      <Image className="h-8 w-8 text-zinc-600" />
      <p className="text-sm text-zinc-500">No image yet</p>
    </div>
  );
}
