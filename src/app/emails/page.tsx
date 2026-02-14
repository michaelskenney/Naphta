"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmailCard } from "@/components/ui/EmailCard";
import { Pagination } from "@/components/ui/Pagination";
import type { EmailSearchResponse } from "@/lib/types";

const PAGE_SIZE = 20;

export default function EmailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-zinc-800"
            />
          ))}
        </div>
      }
    >
      <EmailsPageContent />
    </Suspense>
  );
}

function EmailsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const [data, setData] = useState<EmailSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));

    const res = await fetch(`/api/emails?${params}`);
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }, [query, page]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  function handleSearch(newQuery: string) {
    const params = new URLSearchParams();
    if (newQuery) params.set("query", newQuery);
    router.push(`/emails?${params}`);
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    params.set("page", String(newPage));
    router.push(`/emails?${params}`);
  }

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="flex flex-col gap-6">
      <SearchBar initialQuery={query} onSearch={handleSearch} />

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-zinc-800"
            />
          ))}
        </div>
      ) : !data || data.emails.length === 0 ? (
        <div className="py-16 text-center text-zinc-500">
          {query
            ? `No results for "${query}"`
            : "No emails found. Try a different search."}
        </div>
      ) : (
        <>
          <p className="text-sm text-zinc-400">
            {data.total} result{data.total !== 1 ? "s" : ""}
            {query ? ` for "${query}"` : ""}
          </p>
          <div className="flex flex-col gap-2">
            {data.emails.map((email) => (
              <EmailCard key={email.id} email={email} />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
