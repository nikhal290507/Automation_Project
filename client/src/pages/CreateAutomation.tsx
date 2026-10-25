import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Sparkles, Wand2, Loader2, ArrowRight } from "lucide-react";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { FlowChip, FlowArrow } from "../components/FlowChip";
import { automationsApi, AutomationInput } from "../services/automations";
import { aiApi } from "../services/ai";
import { triggerMeta, conditionMeta, actionMeta } from "../lib/automationMeta";
import { ActionType, ConditionField, ConditionOperator, TriggerType } from "../types";
import { apiErrorMessage } from "../lib/api";
import { cn } from "../lib/utils";

const triggerTypes = Object.keys(triggerMeta) as TriggerType[];
const conditionFields = Object.keys(conditionMeta) as ConditionField[];
const operators: ConditionOperator[] = ["EQUALS", "CONTAINS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN"];
const actionTypes = Object.keys(actionMeta) as ActionType[];

interface ConditionDraft { field: ConditionField; operator: ConditionOperator; value: string }
interface ActionDraft { type: ActionType }

export default function CreateAutomation() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"visual" | "ai">("visual");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState<TriggerType>("NEW_EMAIL");
  const [triggerValue, setTriggerValue] = useState("");
  const [conditions, setConditions] = useState<ConditionDraft[]>([]);
  const [actions, setActions] = useState<ActionDraft[]>([{ type: "SEND_NOTIFICATION" }]);

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerConfigKey = triggerType === "EMAIL_FROM_SENDER" ? "sender" : triggerType === "KEYWORD_DETECTED" ? "keyword" : triggerType === "SCHEDULED_TIME" ? "cron" : null;

  const addCondition = () => setConditions((prev) => [...prev, { field: "SENDER", operator: "CONTAINS", value: "" }]);
  const updateCondition = (i: number, patch: Partial<ConditionDraft>) =>
    setConditions((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const removeCondition = (i: number) => setConditions((prev) => prev.filter((_, idx) => idx !== i));

  const addAction = () => setActions((prev) => [...prev, { type: "SAVE_LOG" }]);
  const updateAction = (i: number, type: ActionType) => setActions((prev) => prev.map((a, idx) => (idx === i ? { type } : a)));
  const removeAction = (i: number) => setActions((prev) => prev.filter((_, idx) => idx !== i));

  const runAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setError(null);
    try {
      const { automation, mode: resultMode } = await aiApi.createAutomation(aiPrompt);
      setAiMode(resultMode);
      setName(automation.name);
      setTriggerType(automation.trigger.type);
      setTriggerValue(String((automation.trigger.config as Record<string, unknown> | undefined)?.[triggerConfigKeyFor(automation.trigger.type)] ?? ""));
      setConditions(automation.conditions.map((c) => ({ field: c.field, operator: c.operator, value: c.value })));
      setActions(automation.actions.length ? automation.actions.map((a) => ({ type: a.type })) : [{ type: "SAVE_LOG" }]);
      setMode("visual");
    } catch (err) {
      setError(apiErrorMessage(err, "AI automation builder requires AutoFlow Premium."));
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { setError("Give your automation a name"); return; }
    if (actions.length === 0) { setError("Add at least one action"); return; }
    setSaving(true);
    setError(null);
    try {
      const input: AutomationInput = {
        name,
        description: description || undefined,
        trigger: { type: triggerType, config: triggerConfigKey ? { [triggerConfigKey]: triggerValue } : {} },
        conditions: conditions.filter((c) => c.value.trim()),
        actions: actions.map((a) => ({ type: a.type })),
      };
      const automation = await automationsApi.create(input);
      navigate(`/automations/${automation.id}`);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Create automation">
      <div className="mb-6 flex gap-2 rounded-xl border border-border bg-surface p-1 w-fit">
        <button onClick={() => setMode("visual")} className={cn("rounded-lg px-4 py-1.5 text-sm font-medium transition-colors", mode === "visual" ? "bg-accent-gradient text-white" : "text-ink-muted")}>
          Visual builder
        </button>
        <button onClick={() => setMode("ai")} className={cn("flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors", mode === "ai" ? "bg-accent-gradient text-white" : "text-ink-muted")}>
          <Sparkles size={14} /> Describe with AI
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl border border-state-danger/30 bg-state-danger/10 px-4 py-2.5 text-sm text-state-danger">{error}</div>}

      {mode === "ai" ? (
        <Card className="p-6">
          <CardTitle className="mb-1">Describe your automation</CardTitle>
          <CardDescription className="mb-4">e.g. "Whenever I receive an email from my professor, mark it important and send me a Telegram notification."</CardDescription>
          <Textarea rows={4} value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Type what you want to automate..." />
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={runAiGenerate} loading={aiLoading}>
              <Wand2 size={15} /> Generate automation
            </Button>
            {aiMode && <span className="text-xs text-ink-faint">Generated in {aiMode} mode</span>}
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Professor emails to Telegram" />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea id="description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this automation do?" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Trigger</CardTitle><CardDescription>What starts this automation</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <Select value={triggerType} onChange={(e) => setTriggerType(e.target.value as TriggerType)}>
                  {triggerTypes.map((t) => <option key={t} value={t}>{triggerMeta[t].label}</option>)}
                </Select>
                {triggerConfigKey && (
                  <Input
                    placeholder={triggerConfigKey === "sender" ? "e.g. professor" : triggerConfigKey === "keyword" ? "e.g. schedule a call" : "e.g. 0 9 * * *"}
                    value={triggerValue}
                    onChange={(e) => setTriggerValue(e.target.value)}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div><CardTitle>Conditions</CardTitle><CardDescription>All must match (optional)</CardDescription></div>
                <Button size="sm" variant="outline" onClick={addCondition}><Plus size={13} /> Add</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {conditions.length === 0 && <p className="text-sm text-ink-faint">No conditions — action runs whenever the trigger fires.</p>}
                {conditions.map((c, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <Select className="w-32" value={c.field} onChange={(e) => updateCondition(i, { field: e.target.value as ConditionField })}>
                      {conditionFields.map((f) => <option key={f} value={f}>{conditionMeta[f].label}</option>)}
                    </Select>
                    <Select className="w-32" value={c.operator} onChange={(e) => updateCondition(i, { operator: e.target.value as ConditionOperator })}>
                      {operators.map((o) => <option key={o} value={o}>{o.replace("_", " ").toLowerCase()}</option>)}
                    </Select>
                    <Input className="flex-1 min-w-[120px]" placeholder="value" value={c.value} onChange={(e) => updateCondition(i, { value: e.target.value })} />
                    <Button size="icon" variant="ghost" onClick={() => removeCondition(i)}><Trash2 size={14} className="text-state-danger" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div><CardTitle>Actions</CardTitle><CardDescription>What happens when conditions pass</CardDescription></div>
                <Button size="sm" variant="outline" onClick={addAction}><Plus size={13} /> Add</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {actions.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-ink-faint w-5">{i + 1}.</span>
                    <Select className="flex-1" value={a.type} onChange={(e) => updateAction(i, e.target.value as ActionType)}>
                      {actionTypes.map((t) => <option key={t} value={t}>{actionMeta[t].label}</option>)}
                    </Select>
                    {actions.length > 1 && <Button size="icon" variant="ghost" onClick={() => removeAction(i)}><Trash2 size={14} className="text-state-danger" /></Button>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Preview + save */}
          <div className="space-y-6">
            <Card className="p-5 sticky top-24">
              <CardTitle className="mb-3">Preview</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <FlowChip icon={triggerMeta[triggerType].icon} label={triggerMeta[triggerType].label} tone="trigger" />
                {conditions.filter((c) => c.value).length > 0 && (
                  <>
                    <FlowArrow />
                    {conditions.filter((c) => c.value).map((c, i) => (
                      <FlowChip key={i} icon={conditionMeta[c.field].icon} label={`${conditionMeta[c.field].label}: ${c.value}`} tone="condition" />
                    ))}
                  </>
                )}
                <FlowArrow />
                {actions.map((a, i) => <FlowChip key={i} icon={actionMeta[a.type].icon} label={actionMeta[a.type].label} tone="action" />)}
              </div>
              <Button className="w-full mt-6" onClick={handleSave} loading={saving}>Save automation <ArrowRight size={15} /></Button>
            </Card>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function triggerConfigKeyFor(type: TriggerType): string {
  if (type === "EMAIL_FROM_SENDER") return "sender";
  if (type === "KEYWORD_DETECTED") return "keyword";
  if (type === "SCHEDULED_TIME") return "cron";
  return "";
}
