import { useEffect, useState } from "react";
import { Activity, Workflow, Plug, Focus, Sparkles, CreditCard, UserPlus } from "lucide-react";
import { AppLayout } from "../layouts/AppLayout";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { activityApi } from "../services/activity";
import { ActivityLogEntry } from "../types";
import { relativeTime } from "../lib/utils";

const iconFor = (type: string) => {
  if (type.startsWith("automation")) return Workflow;
  if (type.startsWith("app")) return Plug;
  if (type.startsWith("focus")) return Focus;
  if (type.startsWith("template") || type.startsWith("ai")) return Sparkles;
  if (type.startsWith("billing")) return CreditCard;
  if (type.startsWith("user")) return UserPlus;
  return Activity;
};

export default function ActivityLog() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { activityApi.list(100).then((l) => { setLogs(l); setLoading(false); }); }, []);

  return (
    <AppLayout title="Activity">
      <p className="text-sm text-ink-muted mb-6">A full timeline of everything AutoFlow has done on your behalf.</p>

      {loading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : logs.length === 0 ? (
        <EmptyState icon={Activity} title="No activity yet" description="Once your automations start running, every action will show up here." />
      ) : (
        <Card className="divide-y divide-border">
          {logs.map((log) => {
            const Icon = iconFor(log.type);
            return (
              <div key={log.id} className="flex items-start gap-3 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-raised shrink-0">
                  <Icon size={14} className="text-ink-muted" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">{log.message}</p>
                  <p className="text-xs text-ink-faint mt-0.5">{relativeTime(log.createdAt)} &middot; <span className="font-mono">{log.type}</span></p>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </AppLayout>
  );
}
