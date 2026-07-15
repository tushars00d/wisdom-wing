import { cn } from "@/lib/utils";

export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-primary/10 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary dark:bg-accentAlt/20 dark:text-accentAlt",
        className
      )}
    >
      {children}
    </span>
  );
}
