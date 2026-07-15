"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { searchService, GlobalSearchResult } from "@/lib/services";

export function GlobalSearch({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    startTransition(async () => {
      const payload = await searchService.global(query);
      setResults(payload.results);
      setOpen(true);
    });
  }, [query]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  return (
    <form onSubmit={submit} className={compact ? "relative w-full" : "relative hidden flex-1 md:block"}>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-soft">
        <Search className="h-4 w-4 text-textMuted" />
        <input
          className="w-full bg-transparent text-sm text-text outline-none"
          placeholder="Search posts, communities, users"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(Boolean(results.length))}
        />
      </div>
      {open && query ? (
        <div className="absolute left-0 right-0 top-16 z-50 overflow-hidden rounded-[22px] border border-border bg-surface shadow-glow">
          {isPending ? <p className="px-4 py-3 text-sm text-textMuted">Searching...</p> : null}
          {!isPending && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-textMuted">No matches found.</p>
          ) : null}
          {results.map((result) => (
            <Link
              key={`${result.type}-${result.id}`}
              href={result.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm hover:bg-surfaceAlt"
            >
              <span className="font-medium text-text">{result.title}</span>
              <span className="ml-2 text-xs uppercase tracking-[0.16em] text-primary">{result.type}</span>
              {result.subtitle ? <p className="mt-1 text-xs text-textMuted">{result.subtitle}</p> : null}
            </Link>
          ))}
        </div>
      ) : null}
    </form>
  );
}
