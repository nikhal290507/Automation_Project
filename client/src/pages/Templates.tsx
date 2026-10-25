import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutTemplate, Lock, Check, Search } from "lucide-react";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { FlowChip, FlowArrow } from "../components/FlowChip";
import { templatesApi } from "../services/templates";
import { Template } from "../types";
import { triggerMeta, conditionMeta, actionMeta, roleLabels } from "../lib/automationMeta";
import { apiErrorMessage } from "../lib/api";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useToast } from "../components/ui/ToastProvider";

export default function Templates() {
  const toast = useToast();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingId, setUsingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [planFilter, setPlanFilter] = useState<"all" | "free" | "premium">("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "role">("name");

  useEffect(() => { templatesApi.list().then((t) => { setTemplates(t); setLoading(false); }); }, []);

  const handleUse = async (t: Template) => {
    setUsingId(t.id);
    setError(null);
    try {
      const automation = await templatesApi.use(t.id);
      setAddedId(t.id);
      toast(`“${t.name}” added to your automations.`);
      setTimeout(() => navigate(`/automations/${automation.id}`), 700);
    } catch (err) {
      const message = apiErrorMessage(err, "Couldn't add this template.");
      setError(message);
      toast(message, "error");
    } finally {
      setUsingId(null);
    }
  };

  const roles = ["ALL", ...Array.from(new Set(templates.map((t) => t.roleType)))];
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return templates
      .filter((template) => {
        const matchesRole = roleFilter === "ALL" || template.roleType === roleFilter;
        const matchesPlan = planFilter === "all" || template.isPremium === (planFilter === "premium");
        const matchesQuery = !normalizedQuery || `${template.name} ${template.description}`.toLowerCase().includes(normalizedQuery);
        return matchesRole && matchesPlan && matchesQuery;
      })
      .sort((a, b) => sortBy === "name" ? a.name.localeCompare(b.name) : roleLabels[a.roleType].localeCompare(roleLabels[b.roleType]) || a.name.localeCompare(b.name));
  }, [templates, query, roleFilter, planFilter, sortBy]);

  return (
    <AppLayout title="Templates">
      <p className="text-sm text-ink-muted mb-5">Ready-made automations you can add in one click, then customize.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${roleFilter === r ? "border-accent-blue bg-accent-gradient-soft text-accent-blue" : "border-border text-ink-muted hover:text-ink"}`}
          >
            {r === "ALL" ? "All roles" : roleLabels[r]}
          </button>
        ))}
      </div>

      <div className="mb-6 grid gap-3 rounded-2xl border border-border bg-surface/60 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_180px_180px]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search templates" aria-label="Search templates" className="pl-9" />
        </div>
        <Select value={planFilter} onChange={(event) => setPlanFilter(event.target.value as typeof planFilter)} aria-label="Filter templates by plan">
          <option value="all">Any plan</option>
          <option value="free">Free templates</option>
          <option value="premium">Premium templates</option>
        </Select>
        <Select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} aria-label="Sort templates">
          <option value="name">Sort: Name A–Z</option>
          <option value="role">Sort: Role</option>
        </Select>
        <p className="text-xs text-ink-faint sm:col-span-2 lg:col-span-3">Showing {filtered.length} of {templates.length} templates</p>
      </div>

      {error && <div className="mb-4 rounded-xl border border-state-danger/30 bg-state-danger/10 px-4 py-2.5 text-sm text-state-danger">{error}</div>}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={LayoutTemplate} title="No templates found" description="Try a different role filter." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((t) => (
            <Card key={t.id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-display text-sm font-semibold text-ink">{t.name}</p>
                {t.isPremium && <Badge tone="accent"><Lock size={10} /> Premium</Badge>}
              </div>
              <p className="text-xs text-ink-muted mb-4 flex-1">{t.description}</p>
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                <FlowChip icon={triggerMeta[t.triggerType].icon} label={triggerMeta[t.triggerType].label} tone="trigger" />
                {t.conditions?.[0] && (
                  <>
                    <FlowArrow />
                    <FlowChip icon={conditionMeta[t.conditions[0].field].icon} label={conditionMeta[t.conditions[0].field].label} tone="condition" />
                  </>
                )}
                <FlowArrow />
                {t.actions.slice(0, 2).map((a, i) => <FlowChip key={i} icon={actionMeta[a.type].icon} label={actionMeta[a.type].label} tone="action" />)}
              </div>
              <Button size="sm" variant={addedId === t.id ? "secondary" : "primary"} onClick={() => handleUse(t)} loading={usingId === t.id} disabled={addedId === t.id}>
                {addedId === t.id ? <><Check size={14} /> Added</> : "Use template"}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
