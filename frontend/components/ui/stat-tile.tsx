import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  hint,
  className
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-border/80 bg-white p-5 shadow-soft",
        className
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-textMuted">{label}</p>
      <p className="mt-4 text-3xl font-bold tracking-tight text-text">{value}</p>
      {hint ? <p className="mt-2 text-sm leading-6 text-textMuted">{hint}</p> : null}
    </div>
  );
}
