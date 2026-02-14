"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
}

export function SearchBar({ initialQuery = "", onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(query);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search emails..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2.5 pl-10 pr-4 text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-500"
      >
        Search
      </button>
    </form>
  );
}
