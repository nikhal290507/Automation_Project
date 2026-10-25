import { useState } from "react";
import { Save, Check } from "lucide-react";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Select } from "../components/ui/Select";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";
import { roleLabels } from "../lib/automationMeta";
import { RoleType } from "../types";
import { apiErrorMessage } from "../lib/api";

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [roleType, setRoleType] = useState<RoleType>(user?.roleType ?? "CUSTOM");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.put("/users/me", { name, roleType });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Settings">
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle><CardDescription>Update your personal details</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
              <p className="mt-1 text-xs text-ink-faint">Email cannot be changed in this MVP.</p>
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select id="role" value={roleType} onChange={(e) => setRoleType(e.target.value as RoleType)}>
                {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </Select>
              <p className="mt-1 text-xs text-ink-faint">Changes which templates are recommended to you.</p>
            </div>
            {error && <p className="text-sm text-state-danger">{error}</p>}
            <Button onClick={handleSave} loading={saving}>
              {saved ? <><Check size={15} /> Saved</> : <><Save size={15} /> Save changes</>}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Security</CardTitle><CardDescription>Your account is protected with hashed password authentication</CardDescription></CardHeader>
          <CardContent>
            <p className="text-sm text-ink-muted">Password changes and two-factor authentication are not part of this MVP.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
