import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Play, Trash2, CheckCircle2, XCircle, MinusCircle, AlertCircle } from "lucide-react";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Switch } from "../components/ui/Switch";
import { Skeleton } from "../components/ui/Skeleton";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AutomationFlowRow } from "../components/AutomationFlowRow";
import { automationsApi } from "../services/automations";
import { Automation, AutomationExecution } from "../types";
import { relativeTime } from "../lib/utils";
import { apiErrorMessage } from "../lib/api";

const statusMeta = {
  SUCCESS: { icon: CheckCircle2, tone: "success" as const, colorClass: "text-state-success" },
  PARTIAL: { icon: AlertCircle, tone: "warning" as const, colorClass: "text-state-warning" },
  FAILED: { icon: XCircle, tone: "danger" as const, colorClass: "text-state-danger" },
  SKIPPED: { icon: MinusCircle, tone: "neutral" as const, colorClass: "text-ink-faint" },
};

export default function AutomationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [automation, setAutomation] = useState<Automation | null>(null);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    const a = await automationsApi.get(id);
    setAutomation(a);
    setExecutions(a.executions ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleToggle = async () => {
    if (!automation) return;
    const updated = await automationsApi.toggle(automation.id);
    setAutomation(updated);
  };

  const handleRun = async () => {
    if (!automation) return;
    setRunning(true);
    try {
      const execution = await automationsApi.run(automation.id, { subject: "Manual test run", sender: "manual@test.com", importance: "high" });
      setExecutions((prev) => [execution, ...prev]);
      const refreshed = await automationsApi.get(automation.id);
      setAutomation(refreshed);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setRunning(false);
    }
  };

  const handleDelete = async () => {
    if (!automation) return;
    await automationsApi.remove(automation.id);
    navigate("/automations");
  };

  if (loading || !automation) {
    return (
      <AppLayout title="Automation">
        <Skeleton className="h-64" />
      </AppLayout>
    );
  }

  return (
    <AppLayout title={automation.name}>
      <Link to="/automations" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-5">
        <ArrowLeft size={14} /> Back to automations
      </Link>

      {error && <div className="mb-4 rounded-xl border border-state-danger/30 bg-state-danger/10 px-4 py-2.5 text-sm text-state-danger">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">{automation.name}</h2>
                {automation.description && <p className="text-sm text-ink-muted mt-1">{automation.description}</p>}
              </div>
              <Badge tone={automation.isEnabled ? "success" : "neutral"}>{automation.isEnabled ? "Active" : "Paused"}</Badge>
            </div>
            <AutomationFlowRow automation={automation} />
            <div className="mt-6 flex items-center gap-3">
              <Button onClick={handleRun} loading={running}><Play size={15} /> Run now</Button>
              <Button variant="outline" onClick={() => setConfirmDelete(true)}><Trash2 size={15} /> Delete</Button>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-ink-muted">Enabled</span>
                <Switch checked={automation.isEnabled} onChange={handleToggle} />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Execution history</CardTitle><CardDescription>Most recent runs, newest first</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {executions.length === 0 && <p className="text-sm text-ink-faint py-2">No executions yet. Click "Run now" to test this automation.</p>}
              {executions.map((e) => {
                const meta = statusMeta[e.status];
                return (
                  <div key={e.id} className="flex items-start gap-3 rounded-xl border border-border bg-surface-raised p-3.5">
                    <meta.icon size={16} className={`mt-0.5 shrink-0 ${meta.colorClass}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge tone={meta.tone}>{e.status}</Badge>
                        <span className="text-xs text-ink-faint">{relativeTime(e.createdAt)}</span>
                        {e.durationMs !== null && <span className="text-xs text-ink-faint">&middot; {e.durationMs}ms</span>}
                      </div>
                      {e.resultSummary && <p className="text-sm text-ink-muted mt-1">{e.resultSummary}</p>}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Trigger</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {automation.triggers.map((t) => (
                <div key={t.id} className="rounded-xl border border-border bg-surface-raised p-3">
                  <p className="font-medium text-ink">{t.type.replace(/_/g, " ")}</p>
                  {t.config && Object.keys(t.config).length > 0 && (
                    <pre className="mt-1.5 text-xs text-ink-faint font-mono overflow-x-auto">{JSON.stringify(t.config, null, 2)}</pre>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Metadata</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-muted">Created</span><span className="text-ink">{relativeTime(automation.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-ink-muted">Last executed</span><span className="text-ink">{relativeTime(automation.lastExecuted)}</span></div>
              <div className="flex justify-between"><span className="text-ink-muted">Conditions</span><span className="text-ink">{automation.conditions.length}</span></div>
              <div className="flex justify-between"><span className="text-ink-muted">Actions</span><span className="text-ink">{automation.actions.length}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this automation?"
        description="This will permanently remove the automation and its execution history."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </AppLayout>
  );
}
