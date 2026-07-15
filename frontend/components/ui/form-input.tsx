import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BaseProps = {
  label: string;
  error?: string;
};

export function FormInput({
  label,
  error,
  className,
  ...props
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-text">{label}</span>
      <input
        className={cn(
          "w-full rounded-lg border border-border bg-bg px-4 py-3 text-sm outline-none transition focus:border-primary",
          className
        )}
        {...props}
      />
      {error ? <span className="text-xs text-rose-500">{error}</span> : null}
    </label>
  );
}

export function FormTextarea({
  label,
  error,
  className,
  ...props
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-text">{label}</span>
      <textarea
        className={cn(
          "min-h-28 w-full rounded-lg border border-border bg-bg px-4 py-3 text-sm outline-none transition focus:border-primary",
          className
        )}
        {...props}
      />
      {error ? <span className="text-xs text-rose-500">{error}</span> : null}
    </label>
  );
}
