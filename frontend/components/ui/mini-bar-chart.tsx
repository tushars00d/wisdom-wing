export function MiniBarChart({
  values,
  labels,
  title
}: {
  values: number[];
  labels: string[];
  title: string;
}) {
  const max = Math.max(...values, 1);

  return (
    <div className="rounded-[24px] border border-border/80 bg-white p-5 shadow-soft">
      <p className="text-sm font-semibold text-text">{title}</p>
      <div className="mt-5 flex h-40 items-end gap-3">
        {values.map((value, index) => (
          <div key={`${labels[index]}-${value}-${index}`} className="flex flex-1 flex-col items-center gap-3">
            <div
              className="w-full rounded-t-[18px] bg-gradient-to-b from-primary to-accent"
              style={{ height: `${Math.max((value / max) * 100, 12)}%` }}
            />
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-textMuted">
              {labels[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
