"use client";

import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/ui/SearchBar";
import { Mail } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  function handleSearch(query: string) {
    const params = query ? `?query=${encodeURIComponent(query)}` : "";
    router.push(`/emails${params}`);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-24">
      <div className="flex flex-col items-center gap-3">
        <Mail className="h-12 w-12 text-emerald-500" />
        <h2 className="text-3xl font-bold tracking-tight text-zinc-50">
          Explore the Corpus
        </h2>
        <p className="max-w-md text-center text-zinc-400">
          Search through the Epstein email archive. Each email generates a
          unique AI illustration on first view.
        </p>
      </div>
      <div className="w-full max-w-lg">
        <SearchBar onSearch={handleSearch} />
      </div>
    </div>
  );
}
