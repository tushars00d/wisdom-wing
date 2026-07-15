import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200",
        variant === "primary" &&
          "bg-primary text-white shadow-soft hover:bg-primaryStrong hover:shadow-glow",
        variant === "secondary" &&
          "border border-border bg-white text-text hover:bg-surfaceAlt",
        variant === "ghost" && "text-textMuted hover:bg-surfaceAlt hover:text-text",
        className
      )}
      {...props}
    />
  );
}
