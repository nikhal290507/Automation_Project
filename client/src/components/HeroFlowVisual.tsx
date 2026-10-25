import { Mail, Sparkles, Send } from "lucide-react";

const nodes = [
  { icon: Mail, label: "Gmail", sub: "New email detected", delay: "0s" },
  { icon: Sparkles, label: "AI Classify", sub: "Important \u2022 Professor", delay: "0.6s" },
  { icon: Send, label: "Telegram", sub: "Notification sent", delay: "1.2s" },
];

// The signature element: a left-to-right automation thread with nodes that
// light up in sequence, mirroring exactly how an AutoFlow automation runs.
export function HeroFlowVisual() {
  return (
    <div className="relative rounded-2xl border border-border bg-surface/80 p-6 sm:p-8 shadow-card overflow-hidden">
      <div className="absolute inset-0 bg-canvas-glow pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {nodes.map((node, i) => (
          <div key={node.label} className="flex flex-1 items-center gap-3">
            <div
              className="flex-1 rounded-xl border border-border bg-surface-raised p-4 animate-node-glow"
              style={{ animationDelay: node.delay }}
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gradient text-white">
                <node.icon size={16} />
              </div>
              <p className="font-display text-sm font-semibold text-ink">{node.label}</p>
              <p className="text-xs text-ink-muted mt-0.5">{node.sub}</p>
            </div>
            {i < nodes.length - 1 && (
              <svg className="hidden sm:block shrink-0" width="28" height="12" viewBox="0 0 28 12">
                <line x1="0" y1="6" x2="24" y2="6" stroke="#4C7CFF" strokeWidth="2" strokeDasharray="4 4" className="animate-flow-pulse" />
                <path d="M20 2 L26 6 L20 10" stroke="#4C7CFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ))}
      </div>
      <p className="relative mt-5 text-xs text-ink-faint font-mono">automation_id: prof_email_to_telegram &middot; status: success &middot; 420ms</p>
    </div>
  );
}
