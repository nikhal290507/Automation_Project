import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Briefcase, Laptop, Presentation, Code2, Settings2, Check, ArrowRight, ArrowLeft, Mail, CalendarClock, Send, Loader2 } from "lucide-react";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";
import { appsApi } from "../services/apps";
import { templatesApi } from "../services/templates";
import { RoleType, Template, AppProvider } from "../types";
import { cn } from "../lib/utils";
import { roleLabels } from "../lib/automationMeta";

const roleOptions: Array<{ value: RoleType; icon: typeof GraduationCap; blurb: string }> = [
  { value: "STUDENT", icon: GraduationCap, blurb: "Classes, assignments, professor emails" },
  { value: "CORPORATE_EMPLOYEE", icon: Briefcase, blurb: "Meetings, Slack-style focus, work email" },
  { value: "FREELANCER", icon: Laptop, blurb: "Client emails, proposals, invoices" },
  { value: "TEACHER", icon: Presentation, blurb: "Student questions, grading reminders" },
  { value: "DEVELOPER", icon: Code2, blurb: "Alerts, deploys, on-call notifications" },
  { value: "CUSTOM", icon: Settings2, blurb: "I'll build my own from scratch" },
];

const appOptions: Array<{ value: AppProvider; icon: typeof Mail; label: string }> = [
  { value: "GMAIL", icon: Mail, label: "Gmail" },
  { value: "GOOGLE_CALENDAR", icon: CalendarClock, label: "Google Calendar" },
  { value: "TELEGRAM", icon: Send, label: "Telegram" },
];

const steps = ["Choose role", "Connect apps", "Preferences", "Recommended", "Done"];

export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<RoleType | null>(null);
  const [connected, setConnected] = useState<AppProvider[]>([]);
  const [digestTime, setDigestTime] = useState("08:00");
  const [focusHours, setFocusHours] = useState("09:00-12:00");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (step === 3 && role) {
      templatesApi.list().then((all) => {
        const relevant = all.filter((t) => t.roleType === role || t.roleType === "CUSTOM").slice(0, 4);
        setTemplates(relevant);
        setSelectedTemplates(relevant.filter((t) => !t.isPremium).map((t) => t.id));
      });
    }
  }, [step, role]);

  const toggleApp = async (provider: AppProvider) => {
    if (connected.includes(provider)) return;
    const label = provider === "TELEGRAM" ? "@you" : "you@example.com";
    await appsApi.connect(provider, label);
    setConnected((prev) => [...prev, provider]);
  };

  const toggleTemplate = (id: string) => {
    setSelectedTemplates((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const finish = async () => {
    setSaving(true);
    try {
      await api.put("/users/me", {
        roleType: role ?? "CUSTOM",
        onboarded: true,
        preferences: { digestTime, focusHours },
      });
      await Promise.all(selectedTemplates.map((id) => templatesApi.use(id)));
      await refreshUser();
      navigate("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="absolute inset-0 bg-canvas-glow pointer-events-none" />
      <div className="relative mx-auto max-w-3xl px-4 py-10">
        <div className="flex justify-center mb-8"><Logo /></div>

        {/* Progress */}
        <div className="mb-10 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={cn("h-1.5 rounded-full transition-colors", i <= step ? "bg-accent-gradient" : "bg-surface-raised")} />
              <p className={cn("mt-1.5 text-[11px] font-medium hidden sm:block", i <= step ? "text-ink" : "text-ink-faint")}>{s}</p>
            </div>
          ))}
        </div>

        <Card className="p-6 sm:p-8">
          {step === 0 && (
            <>
              <h2 className="font-display text-xl font-semibold text-ink">What best describes you?</h2>
              <p className="mt-1 text-sm text-ink-muted">We'll recommend automation templates that fit right away.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {roleOptions.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                      role === r.value ? "border-accent-blue bg-accent-gradient-soft" : "border-border bg-surface-raised hover:bg-surface-hover"
                    )}
                  >
                    <r.icon size={18} className={role === r.value ? "text-accent-blue" : "text-ink-muted"} />
                    <div>
                      <p className="text-sm font-medium text-ink">{roleLabels[r.value]}</p>
                      <p className="text-xs text-ink-muted mt-0.5">{r.blurb}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="font-display text-xl font-semibold text-ink">Connect your apps</h2>
              <p className="mt-1 text-sm text-ink-muted">These run in mock mode locally, no real OAuth required to try AutoFlow.</p>
              <div className="mt-6 space-y-3">
                {appOptions.map((a) => {
                  const isConnected = connected.includes(a.value);
                  return (
                    <button
                      key={a.value}
                      onClick={() => toggleApp(a.value)}
                      className="flex w-full items-center justify-between rounded-xl border border-border bg-surface-raised p-4 hover:bg-surface-hover transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <a.icon size={18} className="text-ink-muted" />
                        <span className="text-sm font-medium text-ink">{a.label}</span>
                      </div>
                      {isConnected ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-state-success"><Check size={14} /> Connected</span>
                      ) : (
                        <span className="text-xs font-medium text-accent-blue">Connect</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-display text-xl font-semibold text-ink">Set your preferences</h2>
              <p className="mt-1 text-sm text-ink-muted">Used to personalize your daily AI summary and Focus Mode windows.</p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-ink-muted mb-1.5 block">Daily AI summary time</label>
                  <input type="time" value={digestTime} onChange={(e) => setDigestTime(e.target.value)} className="h-10 rounded-xl border border-border bg-surface-raised px-3.5 text-sm text-ink" />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink-muted mb-1.5 block">Typical focus hours</label>
                  <input type="text" value={focusHours} onChange={(e) => setFocusHours(e.target.value)} placeholder="09:00-12:00" className="h-10 w-full rounded-xl border border-border bg-surface-raised px-3.5 text-sm text-ink" />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-display text-xl font-semibold text-ink">Recommended for you</h2>
              <p className="mt-1 text-sm text-ink-muted">Selected templates will be added as automations you can edit any time.</p>
              <div className="mt-6 space-y-3">
                {templates.length === 0 && <p className="text-sm text-ink-faint">Loading recommendations...</p>}
                {templates.map((t) => {
                  const selected = selectedTemplates.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTemplate(t.id)}
                      className={cn(
                        "flex w-full items-start justify-between gap-3 rounded-xl border p-4 text-left transition-colors",
                        selected ? "border-accent-blue bg-accent-gradient-soft" : "border-border bg-surface-raised hover:bg-surface-hover"
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">{t.name} {t.isPremium && <span className="ml-1 text-[10px] text-accent-violet">PREMIUM</span>}</p>
                        <p className="text-xs text-ink-muted mt-0.5">{t.description}</p>
                      </div>
                      {selected && <Check size={16} className="text-accent-blue shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 4 && (
            <div className="text-center py-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-gradient text-white mb-4">
                <Check size={26} />
              </div>
              <h2 className="font-display text-xl font-semibold text-ink">You're all set, {user?.name.split(" ")[0]}</h2>
              <p className="mt-1 text-sm text-ink-muted">Your workspace is ready with {selectedTemplates.length} recommended automation{selectedTemplates.length === 1 ? "" : "s"}.</p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ArrowLeft size={16} /> Back
            </Button>
            {step < 4 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && !role}>
                Continue <ArrowRight size={16} />
              </Button>
            ) : (
              <Button onClick={finish} loading={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Go to dashboard"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
