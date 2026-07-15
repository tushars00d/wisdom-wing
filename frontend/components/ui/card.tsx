import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-border/80 bg-surface p-6 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-glow",
        className
      )}
      {...props}
    />
  );
}
