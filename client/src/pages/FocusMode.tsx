import { useEffect, useState } from "react";
import { Focus, Power, History } from "lucide-react";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { focusApi } from "../services/focus";
import { FocusSession } from "../types";
import { relativeTime } from "../lib/utils";

export default function FocusModePage() {
  const [active, setActive] = useState<FocusSession | null>(null);
  const [history, setHistory] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const load = () => focusApi.status().then((d) => { setActive(d.active); setHistory(d.history); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleStart = async () => {
    setToggling(true);
    try {
      const session = await focusApi.start("Manually enabled from Focus Mode page");
      setActive(session);
      load();
    } finally {
      setToggling(false);
    }
  };

  const handleStop = async () => {
    if (!active) return;
    setToggling(true);
    try {
      await focusApi.toggle(active.id);
      setActive(null);
      load();
    } finally {
      setToggling(false);
    }
  };

  return (
    <AppLayout title="Focus Mode">
      {loading ? <Skeleton className="h-48" /> : (
        <div className="space-y-6">
          <Card className="p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-canvas-glow pointer-events-none" />
            <div className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${active ? "bg-accent-gradient animate-node-glow" : "bg-surface-raised"}`}>
              <Focus size={28} className={active ? "text-white" : "text-ink-muted"} />
            </div>
            <h2 className="relative mt-4 font-display text-xl font-semibold text-ink">
              Focus Mode is {active ? "active" : "off"}
            </h2>
            <p className="relative mt-1 text-sm text-ink-muted">
              {active ? active.reason ?? "Notifications are being silenced." : "Automations can enable this automatically during meetings."}
            </p>
            <div className="relative mt-6">
              {active ? (
                <Button variant="danger" onClick={handleStop} loading={toggling}><Power size={15} /> Turn off</Button>
              ) : (
                <Button onClick={handleStart} loading={toggling}><Focus size={15} /> Turn on now</Button>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <History size={16} className="text-ink-muted" />
              <div><CardTitle>History</CardTitle><CardDescription>Recent focus sessions, manual and automated</CardDescription></div>
            </CardHeader>
            <CardContent className="space-y-2">
              {history.length === 0 && <p className="text-sm text-ink-faint py-2">No focus sessions yet.</p>}
              {history.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-raised p-3.5">
                  <div>
                    <p className="text-sm text-ink">{s.reason ?? "Focus session"}</p>
                    <p className="text-xs text-ink-faint mt-0.5">Started {relativeTime(s.startedAt)}</p>
                  </div>
                  <span className={`text-xs font-medium ${s.isActive ? "text-state-success" : "text-ink-faint"}`}>
                    {s.isActive ? "Active" : s.endedAt ? `Ended ${relativeTime(s.endedAt)}` : "Ended"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
