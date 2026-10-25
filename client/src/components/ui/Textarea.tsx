import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex w-full rounded-xl border border-border bg-surface-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint",
        "focus:border-accent-blue/60 focus:ring-2 focus:ring-accent-blue/20 transition-colors outline-none resize-none",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
