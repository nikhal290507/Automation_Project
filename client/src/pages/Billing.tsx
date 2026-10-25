import { useEffect, useState } from "react";
import { Check, Crown } from "lucide-react";
import { AppLayout } from "../layouts/AppLayout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { billingApi } from "../services/billing";
import { Subscription } from "../types";

const freeFeatures = ["5 automations", "Basic templates", "Basic email rules", "Basic dashboard"];
const premiumFeatures = [
  "Unlimited automations",
  "AI automation builder",
  "AI email classification",
  "AI auto-reply",
  "Advanced templates",
  "Cross-app workflows",
  "Analytics",
  "AI daily brief",
];

export default function Billing() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = () => billingApi.get().then((s) => { setSubscription(s); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleUpgrade = async () => { setBusy(true); try { await billingApi.upgrade(); await load(); } finally { setBusy(false); } };
  const handleDowngrade = async () => { setBusy(true); try { await billingApi.downgrade(); await load(); } finally { setBusy(false); } };

  const isPremium = subscription?.plan === "PREMIUM";

  return (
    <AppLayout title="Billing">
      {loading ? <Skeleton className="h-72" /> : (
        <div className="space-y-6">
          <Card className="p-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${isPremium ? "bg-accent-gradient" : "bg-surface-raised"}`}>
                <Crown size={20} className={isPremium ? "text-white" : "text-ink-muted"} />
              </div>
              <div>
                <p className="font-display text-base font-semibold text-ink">{isPremium ? "Premium plan" : "Free plan"}</p>
                <p className="text-sm text-ink-muted">
                  {isPremium ? "Unlimited automations and AI features are unlocked." : "Upgrade for unlimited automations and AI features."}
                </p>
              </div>
            </div>
            <Badge tone={isPremium ? "success" : "neutral"}>{subscription?.status}</Badge>
          </Card>

          <div className="grid gap-5 sm:grid-cols-2">
            <Card className="p-6">
              <p className="text-sm font-medium text-ink-muted">Free</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink">$0<span className="text-sm text-ink-faint font-body">/mo</span></p>
              <ul className="mt-5 space-y-2.5">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-ink-muted"><Check size={14} className="text-state-success shrink-0" /> {f}</li>
                ))}
              </ul>
              {isPremium && <Button variant="outline" className="w-full mt-6" onClick={handleDowngrade} loading={busy}>Downgrade to Free</Button>}
            </Card>

            <Card className="p-6 border-accent-blue/40 shadow-glow">
              <p className="text-sm font-medium text-accent-blue">Premium</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink">$12<span className="text-sm text-ink-faint font-body">/mo</span></p>
              <ul className="mt-5 space-y-2.5">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-ink-muted"><Check size={14} className="text-accent-blue shrink-0" /> {f}</li>
                ))}
              </ul>
              {!isPremium && <Button className="w-full mt-6" onClick={handleUpgrade} loading={busy}>Upgrade to Premium</Button>}
            </Card>
          </div>

          <p className="text-xs text-ink-faint">
            No real payment processor is connected in this MVP — upgrading here flips your plan flag directly so the feature gates can be demoed end to end.
          </p>
        </div>
      )}
    </AppLayout>
  );
}
