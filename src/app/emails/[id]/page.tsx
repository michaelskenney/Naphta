"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ImagePanel } from "@/components/ui/ImagePanel";
import type { EmailDetail, ImageState } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EmailDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [email, setEmail] = useState<EmailDetail | null>(null);
  const [imageState, setImageState] = useState<ImageState>("none");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/emails/${id}`);
      if (!res.ok) return;
      const data: EmailDetail = await res.json();
      setEmail(data);
      setImageState(data.imageState);
      setImageUrl(data.imageUrl);
      setLoading(false);

      if (data.imageState === "none" || data.imageState === "pending") {
        fetch(`/api/emails/${id}/image/ensure`, { method: "POST" });
        setImageState("pending");
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (imageState !== "pending") return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/emails/${id}/image/status`);
      if (!res.ok) return;
      const data = await res.json();
      setImageState(data.state);
      setImageUrl(data.imageUrl);
      if (data.state !== "pending") clearInterval(interval);
    }, 2000);

    return () => clearInterval(interval);
  }, [id, imageState]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
        <div className="h-64 animate-pulse rounded-lg bg-zinc-800" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="py-16 text-center text-zinc-500">Email not found</div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => router.back()}
        className="flex w-fit items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-200"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to results
      </button>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-4 lg:w-3/5">
          <h2 className="text-2xl font-bold text-zinc-50">
            {email.subject ?? "(No subject)"}
          </h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-zinc-500">From</dt>
            <dd className="text-zinc-300">
              {email.sender ?? "Unknown"}
            </dd>
            <dt className="text-zinc-500">To</dt>
            <dd className="text-zinc-300">
              {email.recipients ?? "Unknown"}
            </dd>
            <dt className="text-zinc-500">Date</dt>
            <dd className="text-zinc-300">
              {email.sentAt
                ? new Date(email.sentAt).toLocaleString()
                : "Unknown"}
            </dd>
          </dl>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-300">
              {email.bodyText ?? "(No body)"}
            </pre>
          </div>
        </div>

        <div className="lg:w-2/5">
          <ImagePanel state={imageState} imageUrl={imageUrl} />
        </div>
      </div>
    </div>
  );
}
