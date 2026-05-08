import type { InputHTMLAttributes } from "react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement>;

export function AuthInput({ className, ...props }: AuthInputProps) {
  return (
    <input
      className={`w-full rounded-xl border border-border bg-surface-low px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 ${className ?? ""}`}
      {...props}
    />
  );
}
