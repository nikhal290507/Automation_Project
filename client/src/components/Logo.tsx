import { cn } from "../lib/utils";

export function Logo({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 font-display font-semibold text-ink", className)}>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-gradient text-white">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M4 15 L9 8 L13 13 L20 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {!iconOnly && <span>AutoFlow</span>}
    </div>
  );
}
