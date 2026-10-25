import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border border-border bg-surface-raised px-3.5 text-sm text-ink placeholder:text-ink-faint",
        "focus:border-accent-blue/60 focus:ring-2 focus:ring-accent-blue/20 transition-colors outline-none",
        "disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
