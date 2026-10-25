import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun, Moon, LogOut, RotateCcw, Mail, CalendarDays, Send, MessageCircle, Check, GraduationCap, Briefcase,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card } from '../components/Common';
import ConfirmDialog from '../components/ConfirmDialog';
import type { AppId, Role } from '../types';

const appMeta: Record<AppId, { icon: typeof Mail; name: string }> = {
  gmail: { icon: Mail, name: 'Gmail' },
  gcal: { icon: CalendarDays, name: 'Google Calendar' },
  telegram: { icon: Send, name: 'Telegram' },
  whatsapp: { icon: MessageCircle, name: 'WhatsApp' },
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-600'}`}
      style={{ height: 22 }}
    >
      <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} style={{ width: 18, height: 18 }} />
    </button>
  );
}

export default function Settings() {
  const { user, setRole, connections, toggleConnection, theme, toggleTheme, notificationPrefs, updateNotificationPrefs, resetDemoData, logout, pushToast } = useApp();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your profile, connections, and preferences.</p>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">Profile</h3>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-semibold" style={{ backgroundColor: user?.avatarColor }}>
            {(user?.name || 'D U').split(' ').map((p) => p[0]).slice(0, 2).join('')}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">Role</h3>
        <div className="grid grid-cols-2 gap-3">
          {[{ role: 'student' as Role, icon: GraduationCap, label: 'Student' }, { role: 'professional' as Role, icon: Briefcase, label: 'Professional' }].map(({ role, icon: Icon, label }) => (
            <button
              key={role}
              onClick={() => setRole(role)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-colors ${
                user?.role === role ? 'border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:border-brand-500/40 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Icon size={16} /> {label} {user?.role === role && <Check size={14} className="ml-auto" />}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">Connected Apps</h3>
        <div className="space-y-2.5">
          {connections.map((c) => {
            const meta = appMeta[c.id];
            const Icon = meta.icon;
            return (
              <div key={c.id} className="flex items-center gap-3 py-1.5">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 shrink-0">
                  <Icon size={16} />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-200 flex-1">{meta.name}</span>
                <button
                  onClick={() => { toggleConnection(c.id); pushToast(c.connected ? `Disconnected ${meta.name}` : `Connected ${meta.name} (Simulated)`); }}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${c.connected ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                >
                  {c.connected ? 'Connected' : 'Connect'}
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">Notification Preferences</h3>
        <div className="space-y-3.5">
          {([
            ['emailAlerts', 'Email alerts'],
            ['meetingReminders', 'Meeting reminders'],
            ['automationAlerts', 'Automation alerts'],
            ['focusModeMutes', 'Mute notifications during Focus Mode'],
          ] as const).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
              <Toggle checked={notificationPrefs[key]} onChange={() => updateNotificationPrefs({ [key]: !notificationPrefs[key] })} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">Appearance</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-300">Theme</span>
          <button onClick={toggleTheme} className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
            {theme === 'light' ? <><Moon size={14} /> Switch to Dark</> : <><Sun size={14} /> Switch to Light</>}
          </button>
        </div>
      </Card>

      <Card className="p-5 border-rose-100 dark:border-rose-500/20">
        <h3 className="font-semibold text-rose-600 dark:text-rose-400 text-sm mb-4">Danger Zone</h3>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button onClick={() => setConfirmReset(true)} className="inline-flex items-center justify-center gap-2 text-sm font-medium px-3.5 py-2 rounded-lg border border-rose-200 dark:border-rose-500/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
            <RotateCcw size={14} /> Reset Demo Data
          </button>
          <button onClick={() => setConfirmLogout(true)} className="inline-flex items-center justify-center gap-2 text-sm font-medium px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmReset}
        title="Reset all demo data?"
        description="This will erase every email, task, event, and automation, restoring the original demo dataset."
        confirmLabel="Reset"
        onConfirm={resetDemoData}
        onCancel={() => setConfirmReset(false)}
      />
      <ConfirmDialog
        open={confirmLogout}
        title="Log out of AutoFlow?"
        description="You can sign back in anytime — your data stays saved in this browser."
        confirmLabel="Log Out"
        danger={false}
        onConfirm={() => { logout(); navigate('/'); }}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
}
