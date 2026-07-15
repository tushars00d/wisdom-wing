"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { GlobalSearchResult, searchService } from "@/lib/services";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult[]>([]);

  useEffect(() => {
    const nextQuery = new URLSearchParams(window.location.search).get("q") ?? "";
    setQuery(nextQuery);
  }, []);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    searchService.global(query).then((payload) => setResults(payload.results));
  }, [query]);

  return (
    <AppShell title="Search" subtitle="Search across posts, communities, users, and tags.">
      <Card className="space-y-4">
        <p className="text-sm text-textMuted">
          {query ? `Results for "${query}"` : "Type in the top search bar and press Enter."}
        </p>
      </Card>
      <div className="space-y-4">
        {results.map((result) => (
          <Link key={`${result.type}-${result.id}`} href={result.href}>
            <Card className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{result.type}</p>
              <h3 className="text-lg font-semibold">{result.title}</h3>
              {result.subtitle ? <p className="text-sm text-textMuted">{result.subtitle}</p> : null}
            </Card>
          </Link>
        ))}
        {query && !results.length ? (
          <Card>
            <p className="text-sm text-textMuted">No matching posts, communities, or users found.</p>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
