"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";

type SearchResult = {
  _id: string;
  title: string;
  body: string;
  tags: string[];
  searchType?: string;
};

export function QuestionSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [mode, setMode] = useState<"hybrid" | "keyword" | "semantic">("hybrid");
  const [isPending, startTransition] = useTransition();

  const runSearch = (nextQuery: string, nextMode = mode) => {
    setQuery(nextQuery);

    if (!nextQuery.trim()) {
      setResults([]);
      return;
    }

    startTransition(async () => {
      try {
        const payload = await apiFetch<{ results: SearchResult[] }>(
          `/api/search/questions?query=${encodeURIComponent(nextQuery)}&mode=${nextMode}`
        );
        setResults(payload.results);
      } catch (error) {
        console.error(error);
        setResults([]);
      }
    });
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-bg px-4 py-3">
          <Search className="h-4 w-4 text-textMuted" />
          <input
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Search posted questions by keyword or meaning"
            value={query}
            onChange={(event) => runSearch(event.target.value)}
          />
        </div>
        <div className="flex gap-2 text-sm">
          {(["hybrid", "keyword", "semantic"] as const).map((value) => (
            <button
              key={value}
              onClick={() => {
                setMode(value);
                runSearch(query, value);
              }}
              className={
                mode === value
                  ? "rounded-full bg-primary px-3 py-1 text-white"
                  : "rounded-full border border-border px-3 py-1 text-textMuted"
              }
            >
              {value}
            </button>
          ))}
        </div>
      </Card>

      {isPending ? <p className="text-sm text-textMuted">Searching posted questions...</p> : null}

      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result._id} className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold">{result.title}</p>
              {result.searchType ? <Tag>{result.searchType}</Tag> : null}
            </div>
            <p className="text-sm leading-6 text-textMuted">{result.body}</p>
            <div className="flex flex-wrap gap-2">
              {result.tags?.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
