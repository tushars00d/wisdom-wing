export function SectionTitle({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
      <h2 className="text-3xl font-bold tracking-tight text-text">{title}</h2>
      <p className="max-w-2xl text-base text-textMuted">{description}</p>
    </div>
  );
}
