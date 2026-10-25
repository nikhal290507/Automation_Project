import { useEffect, useState } from "react";
import { Plug, Trash2, Mail, CalendarClock, Send, Inbox, MessageCircle } from "lucide-react";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { appsApi } from "../services/apps";
import { AppProvider, ConnectedApp } from "../types";
import { relativeTime } from "../lib/utils";

const catalog: Array<{ provider: AppProvider; label: string; icon: typeof Mail; note: string }> = [
  { provider: "GMAIL", label: "Gmail", icon: Mail, note: "Read triggers, send auto-replies" },
  { provider: "GOOGLE_CALENDAR", label: "Google Calendar", icon: CalendarClock, note: "Detect meetings, create events" },
  { provider: "TELEGRAM", label: "Telegram", icon: Send, note: "Instant automation notifications" },
  { provider: "OUTLOOK", label: "Outlook", icon: Inbox, note: "Alternative email provider" },
  { provider: "WHATSAPP", label: "WhatsApp", icon: MessageCircle, note: "Send messages via automations" },
];

export default function ConnectedApps() {
  const [apps, setApps] = useState<ConnectedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<AppProvider | null>(null);

  const load = () => appsApi.list().then((a) => { setApps(a); setLoading(false); });
  useEffect(() => { load(); }, []);

  const connectedFor = (provider: AppProvider) => apps.find((a) => a.provider === provider);

  const handleConnect = async (provider: AppProvider) => {
    setBusy(provider);
    try {
      const label = provider === "TELEGRAM" ? "@you" : provider === "WHATSAPP" ? "+1 555 0100" : "you@example.com";
      await appsApi.connect(provider, label);
      load();
    } finally {
      setBusy(null);
    }
  };

  const handleDisconnect = async (app: ConnectedApp) => {
    setBusy(app.provider);
    try {
      await appsApi.disconnect(app.id);
      load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <AppLayout title="Connected apps">
      <p className="text-sm text-ink-muted mb-6">
        All integrations run in mock mode until real OAuth credentials are configured on the server. See the README for details.
      </p>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {catalog.map((c) => {
            const connected = connectedFor(c.provider);
            return (
              <Card key={c.provider} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-raised">
                      <c.icon size={18} className="text-ink-muted" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{c.label}</p>
                      <p className="text-xs text-ink-muted">{c.note}</p>
                    </div>
                  </div>
                  {connected && <Badge tone="accent">Mock</Badge>}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  {connected ? (
                    <>
                      <p className="text-xs text-ink-faint">Connected {relativeTime(connected.connectedAt)} &middot; {connected.accountLabel}</p>
                      <Button size="sm" variant="ghost" onClick={() => handleDisconnect(connected)} loading={busy === c.provider}>
                        <Trash2 size={13} className="text-state-danger" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleConnect(c.provider)} loading={busy === c.provider}>
                      <Plug size={13} /> Connect
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
