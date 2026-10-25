import { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "accent";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-raised text-ink-muted border-border",
  success: "bg-state-success/10 text-state-success border-state-success/25",
  warning: "bg-state-warning/10 text-state-warning border-state-warning/25",
  danger: "bg-state-danger/10 text-state-danger border-state-danger/25",
  accent: "bg-accent-gradient-soft text-accent-blue border-accent-blue/25",
};

export function Badge({ className, tone = "neutral", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
