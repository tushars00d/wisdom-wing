"use client";

import { cn } from "@/lib/utils";

export function Tabs<T extends string>({
  tabs,
  value,
  onChange
}: {
  tabs: Array<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-surface p-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition",
            value === tab.value ? "bg-primary text-white" : "text-textMuted hover:bg-surfaceAlt hover:text-text"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
