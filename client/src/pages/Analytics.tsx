import { useEffect, useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { BarChart3 } from "lucide-react";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { analyticsApi, AnalyticsData } from "../services/analytics";

const tooltipStyle = { background: "#161D33", border: "1px solid #212A46", borderRadius: 12, fontSize: 12, color: "#F2F4FA" };

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { analyticsApi.get().then((d) => { setData(d); setLoading(false); }); }, []);

  if (loading || !data) {
    return <AppLayout title="Analytics"><Skeleton className="h-96" /></AppLayout>;
  }

  return (
    <AppLayout title="Analytics">
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card className="p-5">
          <p className="text-xs text-ink-muted">Total runs (14d)</p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink">{data.totalRuns}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-ink-muted">Success rate</p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink">{data.successRate}%</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-ink-muted">Most active automation</p>
          <p className="mt-1 font-display text-lg font-semibold text-ink truncate">{data.topAutomations[0]?.name ?? "—"}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Execution volume</CardTitle><CardDescription>Runs by outcome over the last 14 days</CardDescription></CardHeader>
          <CardContent>
            {data.timeline.length === 0 ? (
              <EmptyState icon={BarChart3} title="Not enough data yet" description="Run a few automations to see trends here." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.timeline}>
                  <defs>
                    <linearGradient id="success" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4C7CFF" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#4C7CFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1A2138" vertical={false} />
                  <XAxis dataKey="date" stroke="#5C6584" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#5C6584" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="success" stroke="#4C7CFF" fill="url(#success)" strokeWidth={2} name="Success" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top automations</CardTitle><CardDescription>By number of runs</CardDescription></CardHeader>
          <CardContent>
            {data.topAutomations.length === 0 ? (
              <p className="text-sm text-ink-faint py-4 text-center">No runs yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.topAutomations} layout="vertical" margin={{ left: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100} stroke="#96A0BE" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(76,124,255,0.08)" }} />
                  <Bar dataKey="runs" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
