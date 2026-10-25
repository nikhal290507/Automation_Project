import { LabelHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-ink-muted mb-1.5 block", className)} {...props} />;
}
