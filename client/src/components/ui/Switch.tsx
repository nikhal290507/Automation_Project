import { cn } from "../../lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

export function Switch({ checked, onChange, disabled, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0",
        checked ? "bg-accent-gradient" : "bg-surface-raised border border-border",
        disabled && "opacity-50 pointer-events-none"
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
