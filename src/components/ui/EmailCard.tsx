import Link from "next/link";
import { Mail, Image, AlertCircle } from "lucide-react";
import type { EmailListItem, ImageState } from "@/lib/types";

const stateBadge: Record<ImageState, { label: string; className: string }> = {
  ready: { label: "Image", className: "bg-emerald-900 text-emerald-300" },
  pending: { label: "Generating", className: "bg-amber-900 text-amber-300" },
  failed: { label: "Failed", className: "bg-red-900 text-red-300" },
  moderated: { label: "Moderated", className: "bg-red-900 text-red-300" },
  none: { label: "No image", className: "bg-zinc-800 text-zinc-400" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "Unknown date";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function EmailCard({ email }: { email: EmailListItem }) {
  const badge = stateBadge[email.imageState];

  return (
    <Link
      href={`/emails/${email.id}`}
      className="group block rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-600 hover:bg-zinc-800/80"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 overflow-hidden">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
          <div className="min-w-0">
            <p className="truncate font-medium text-zinc-100 group-hover:text-white">
              {email.subject ?? "(No subject)"}
            </p>
            <p className="mt-1 truncate text-sm text-zinc-400">
              {email.sender ?? "Unknown sender"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
          >
            {email.imageState === "ready" && <Image className="h-3 w-3" />}
            {(email.imageState === "failed" ||
              email.imageState === "moderated") && (
              <AlertCircle className="h-3 w-3" />
            )}
            {badge.label}
          </span>
          <span className="text-xs text-zinc-500">
            {formatDate(email.sentAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
