import { LucideIcon, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";

export function FlowChip({ icon: Icon, label, tone = "neutral" }: { icon: LucideIcon; label: string; tone?: "trigger" | "condition" | "action" | "neutral" }) {
  const toneClasses = {
    trigger: "border-accent-blue/30 bg-accent-blue/10 text-accent-blue",
    condition: "border-state-warning/30 bg-state-warning/10 text-state-warning",
    action: "border-accent-violet/30 bg-accent-violet/10 text-accent-violet",
    neutral: "border-border bg-surface-raised text-ink-muted",
  }[tone];

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium whitespace-nowrap", toneClasses)}>
      <Icon size={12} />
      {label}
    </span>
  );
}

export function FlowArrow() {
  return <ArrowRight size={14} className="shrink-0 text-ink-faint" />;
}
