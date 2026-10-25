import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail, CalendarClock, Workflow, Focus, Plus, ArrowRight, Sparkles, Plug, Activity as ActivityIcon,
} from "lucide-react";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { AutomationFlowRow } from "../components/AutomationFlowRow";
import { useAuth } from "../hooks/useAuth";
import { dashboardApi } from "../services/dashboard";
import { DashboardData } from "../types";
import { relativeTime } from "../lib/utils";
import { providerMeta } from "../lib/automationMeta";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <AppLayout title="Dashboard">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-ink">{greeting}, {data?.greetingName ?? user?.name.split(" ")[0]}</h2>
        <p className="mt-1 text-sm text-ink-muted">Here's what AutoFlow has been up to.</p>
      </div>

      {loading || !data ? <DashboardSkeleton /> : (
        <div className="space-y-6">
          {/* Top stat row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Productivity score" value={`${data.productivityScore}`} suffix="/100" icon={Sparkles} tone="accent" />
            <StatCard label="Important emails" value={`${data.importantEmails.length}`} icon={Mail} tone="blue" />
            <StatCard label="Meetings today" value={`${data.meetingsToday.length}`} icon={CalendarClock} tone="violet" />
            <StatCard label="Active automations" value={`${data.activeAutomations.length}`} icon={Workflow} tone="success" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left / main column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Focus Mode */}
              <Card>
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${data.focusSession?.isActive ? "bg-accent-gradient" : "bg-surface-raised"}`}>
                      <Focus size={18} className={data.focusSession?.isActive ? "text-white" : "text-ink-muted"} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">Focus Mode {data.focusSession?.isActive ? "active" : "inactive"}</p>
                      <p className="text-xs text-ink-muted">{data.focusSession?.reason ?? "No focus session running"}</p>
                    </div>
                  </div>
                  <Link to="/focus"><Button variant="outline" size="sm">Manage</Button></Link>
                </CardContent>
              </Card>

              {/* Automations */}
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <div>
                    <CardTitle>Your automations</CardTitle>
                    <CardDescription>Trigger → condition → action, at a glance</CardDescription>
                  </div>
                  <Link to="/automations/new"><Button size="sm"><Plus size={14} /> New</Button></Link>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.automations.length === 0 && (
                    <p className="text-sm text-ink-faint py-4 text-center">No automations yet — create your first one.</p>
                  )}
                  {data.automations.map((a) => (
                    <Link key={a.id} to={`/automations/${a.id}`} className="block rounded-xl border border-border bg-surface-raised p-4 hover:bg-surface-hover transition-colors">
                      <div className="flex items-center justify-between mb-2.5">
                        <p className="text-sm font-medium text-ink">{a.name}</p>
                        <Badge tone={a.isEnabled ? "success" : "neutral"}>{a.isEnabled ? "Active" : "Paused"}</Badge>
                      </div>
                      <AutomationFlowRow automation={a} />
                      <p className="mt-2.5 text-xs text-ink-faint">Last run: {relativeTime(a.lastExecuted)}</p>
                    </Link>
                  ))}
                  <Link to="/automations" className="flex items-center justify-center gap-1 text-sm font-medium text-accent-blue hover:underline pt-1">
                    View all automations <ArrowRight size={14} />
                  </Link>
                </CardContent>
              </Card>

              {/* Important emails */}
              <Card>
                <CardHeader><CardTitle>Important emails</CardTitle><CardDescription>Flagged high-importance by your automations</CardDescription></CardHeader>
                <CardContent className="space-y-2">
                  {data.importantEmails.length === 0 && <p className="text-sm text-ink-faint py-2">Nothing urgent right now.</p>}
                  {data.importantEmails.map((e) => (
                    <div key={e.id} className="flex items-start gap-3 rounded-xl border border-border bg-surface-raised p-3.5">
                      <Mail size={16} className="mt-0.5 text-accent-blue shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{e.subject}</p>
                        <p className="text-xs text-ink-muted truncate">{e.sender} &middot; {relativeTime(e.receivedAt)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Daily AI summary</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <SummaryRow label="Emails processed" value={data.dailySummary.emailsProcessed} />
                  <SummaryRow label="Automations run (7d)" value={data.dailySummary.automationsRun} />
                  <SummaryRow label="Success rate" value={`${data.dailySummary.successRate}%`} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Meetings today</CardTitle></CardHeader>
                <CardContent className="space-y-2.5">
                  {data.meetingsToday.length === 0 && <p className="text-sm text-ink-faint">No meetings scheduled.</p>}
                  {data.meetingsToday.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised p-3">
                      <CalendarClock size={15} className="text-accent-violet shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{m.title}</p>
                        <p className="text-xs text-ink-muted">{new Date(m.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>Connected apps</CardTitle>
                  <Link to="/apps"><Plug size={15} className="text-ink-muted hover:text-ink" /></Link>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.connectedApps.map((app) => (
                    <div key={app.id} className="flex items-center justify-between text-sm">
                      <span className="text-ink-muted">{providerMeta[app.provider]?.label}</span>
                      <Badge tone={app.status === "MOCK" ? "accent" : "success"}>{app.status === "MOCK" ? "Mock" : "Live"}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>Recent activity</CardTitle>
                  <Link to="/activity"><ActivityIcon size={15} className="text-ink-muted hover:text-ink" /></Link>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.recentActivity.map((log) => (
                    <div key={log.id} className="text-sm">
                      <p className="text-ink-muted">{log.message}</p>
                      <p className="text-xs text-ink-faint mt-0.5">{relativeTime(log.createdAt)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function StatCard({ label, value, suffix, icon: Icon, tone }: { label: string; value: string; suffix?: string; icon: typeof Mail; tone: "accent" | "blue" | "violet" | "success" }) {
  const toneClass = {
    accent: "bg-accent-gradient text-white",
    blue: "bg-accent-blue/15 text-accent-blue",
    violet: "bg-accent-violet/15 text-accent-violet",
    success: "bg-state-success/15 text-state-success",
  }[tone];
  return (
    <Card className="p-5">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClass}`}>
        <Icon size={16} />
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-ink">{value}<span className="text-sm text-ink-faint font-body">{suffix}</span></p>
      <p className="text-xs text-ink-muted mt-0.5">{label}</p>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-64" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    </div>
  );
}
