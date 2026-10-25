import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Workflow, Play, Trash2, Search } from "lucide-react";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Switch } from "../components/ui/Switch";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AutomationFlowRow } from "../components/AutomationFlowRow";
import { automationsApi } from "../services/automations";
import { Automation } from "../types";
import { relativeTime } from "../lib/utils";
import { apiErrorMessage } from "../lib/api";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useToast } from "../components/ui/ToastProvider";

export default function Automations() {
  const toast = useToast();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Automation | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");
  const [sortBy, setSortBy] = useState<"updated" | "name" | "created">("updated");

  const load = () => automationsApi.list().then((data) => { setAutomations(data); }).catch((err) => {
    setError(apiErrorMessage(err, "Couldn't load your automations."));
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const visibleAutomations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return automations
      .filter((automation) => {
        const matchesQuery = !normalizedQuery || `${automation.name} ${automation.description ?? ""}`.toLowerCase().includes(normalizedQuery);
        const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? automation.isEnabled : !automation.isEnabled);
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "created") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return new Date(b.lastExecuted ?? 0).getTime() - new Date(a.lastExecuted ?? 0).getTime();
      });
  }, [automations, query, sortBy, statusFilter]);

  const handleToggle = async (a: Automation) => {
    setAutomations((prev) => prev.map((x) => (x.id === a.id ? { ...x, isEnabled: !x.isEnabled } : x)));
    try {
      await automationsApi.toggle(a.id);
    } catch (err) {
      setError(apiErrorMessage(err));
      load();
    }
  };

  const handleRun = async (a: Automation) => {
    setRunningId(a.id);
    try {
      const execution = await automationsApi.run(a.id, { subject: "Test trigger from UI", sender: "manual@test.com", importance: "high" });
      toast(`“${a.name}” ran: ${execution.status.toLowerCase()}`, execution.status === "FAILED" ? "error" : "success");
      load();
    } catch (err) {
      toast(apiErrorMessage(err, "Couldn't run this automation."), "error");
    } finally {
      setRunningId(null);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await automationsApi.remove(pendingDelete.id);
      setAutomations((prev) => prev.filter((x) => x.id !== pendingDelete.id));
      toast("Automation deleted.");
      setPendingDelete(null);
    } catch (err) {
      toast(apiErrorMessage(err, "Couldn't delete this automation."), "error");
    }
  };

  return (
    <AppLayout title="Automations">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">{automations.length} automation{automations.length === 1 ? "" : "s"}</p>
        <Link to="/automations/new"><Button><Plus size={16} /> New automation</Button></Link>
      </div>

      {error && <div className="mb-4 rounded-xl border border-state-danger/30 bg-state-danger/10 px-4 py-2.5 text-sm text-state-danger">{error}</div>}

      <div className="mb-5 rounded-2xl border border-border bg-surface/60 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex w-fit rounded-xl bg-canvas/70 p-1" role="tablist" aria-label="Filter automations by status">
            {(["all", "active", "paused"] as const).map((status) => {
              const count = status === "all" ? automations.length : automations.filter((item) => item.isEnabled === (status === "active")).length;
              return (
                <button
                  key={status}
                  type="button"
                  role="tab"
                  id={`status-${status}-tab`}
                  aria-controls="automation-results"
                  aria-selected={statusFilter === status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium capitalize transition-colors ${statusFilter === status ? "bg-surface-raised text-ink shadow-card" : "text-ink-muted hover:text-ink"}`}
                >
                  {status} <span className="ml-1 text-ink-faint">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_190px] lg:w-[440px]">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search automations" aria-label="Search automations" className="pl-9" />
            </div>
            <Select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} aria-label="Sort automations">
              <option value="updated">Sort: Last run</option>
              <option value="created">Sort: Recently created</option>
              <option value="name">Sort: Name A–Z</option>
            </Select>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-faint">Showing {visibleAutomations.length} of {automations.length} automations</p>
      </div>

      <div id="automation-results" role="tabpanel" aria-labelledby={`status-${statusFilter}-tab`}>
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : automations.length === 0 ? (
        <EmptyState
          icon={Workflow}
          title="No automations yet"
          description="Create your first automation, or start from a role-based template."
          action={<Link to="/automations/new"><Button><Plus size={16} /> Create automation</Button></Link>}
        />
      ) : visibleAutomations.length === 0 ? (
        <EmptyState icon={Search} title="No automations match" description="Try a different search or status filter." />
      ) : (
        <div className="space-y-3">
          {visibleAutomations.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <Link to={`/automations/${a.id}`} className="min-w-0">
                  <p className="font-display text-sm font-semibold text-ink hover:text-accent-blue transition-colors">{a.name}</p>
                  {a.description && <p className="text-xs text-ink-muted mt-0.5">{a.description}</p>}
                </Link>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge tone={a.isEnabled ? "success" : "neutral"}>{a.isEnabled ? "Active" : "Paused"}</Badge>
                  <Switch checked={a.isEnabled} onChange={() => handleToggle(a)} aria-label={`Toggle ${a.name}`} />
                </div>
              </div>
              <AutomationFlowRow automation={a} />
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-ink-faint">Last run: {relativeTime(a.lastExecuted)}</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleRun(a)} loading={runningId === a.id}>
                    <Play size={13} /> Run now
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setPendingDelete(a)}>
                    <Trash2 size={13} className="text-state-danger" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this automation?"
        description={`"${pendingDelete?.name}" and its execution history will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </AppLayout>
  );
}
