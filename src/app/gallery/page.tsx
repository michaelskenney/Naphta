"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ImageIcon, AlertCircle, ExternalLink } from "lucide-react";
import type { GalleryItem, GalleryResponse } from "@/lib/types";

function formatDate(iso: string | null): string {
  if (!iso) return "Unknown";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function GalleryCard({ item }: { item: GalleryItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 transition hover:border-zinc-600">
      {item.imageUrl ? (
        <div className="relative aspect-square bg-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.subject ?? "Generated image"}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <Link
            href={`/emails/${item.emailId}`}
            className="absolute right-2 top-2 rounded-full bg-zinc-900/80 p-1.5 opacity-0 backdrop-blur-sm transition group-hover:opacity-100"
          >
            <ExternalLink className="h-3.5 w-3.5 text-zinc-300" />
          </Link>
        </div>
      ) : (
        <div className="flex aspect-square items-center justify-center bg-zinc-800">
          <AlertCircle className="h-8 w-8 text-zinc-600" />
        </div>
      )}

      <div className="p-3">
        <Link
          href={`/emails/${item.emailId}`}
          className="block truncate text-sm font-medium text-zinc-100 hover:text-white"
        >
          {item.subject ?? "(No subject)"}
        </Link>
        <p className="mt-0.5 truncate text-xs text-zinc-500">
          {item.sender ?? "Unknown sender"}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900 px-2 py-0.5 text-xs font-medium text-emerald-300">
            <ImageIcon className="h-3 w-3" />
            {item.model ?? "ai"}
          </span>
          <span className="text-xs text-zinc-600">
            {formatDate(item.generatedAt)}
          </span>
        </div>

        {item.promptUsed && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs text-zinc-500 hover:text-zinc-300"
          >
            {expanded ? "Hide prompt" : "Show prompt"}
          </button>
        )}
        {expanded && item.promptUsed && (
          <p className="mt-1 rounded bg-zinc-800 p-2 text-xs leading-relaxed text-zinc-400">
            {item.promptUsed}
          </p>
        )}
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [data, setData] = useState<GalleryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch("/api/gallery");
        if (!res.ok) {
          setError(`Failed to load gallery: ${res.status}`);
          return;
        }
        setData(await res.json());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load gallery",
        );
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">
            Generated Images
          </h2>
          <p className="text-sm text-zinc-500">
            All emails with successfully generated images
          </p>
        </div>
        {data && (
          <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-400">
            {data.total} image{data.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg">
              <div className="aspect-square animate-pulse bg-zinc-800" />
              <div className="space-y-2 bg-zinc-900 p-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-800" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : !data || data.images.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <ImageIcon className="h-10 w-10 text-zinc-600" />
          <p className="text-zinc-500">No images generated yet</p>
          <p className="text-sm text-zinc-600">
            Open an email to trigger image generation
          </p>
          <Link
            href="/emails"
            className="mt-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-700"
          >
            Browse emails
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.images.map((item) => (
            <GalleryCard key={item.emailId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
