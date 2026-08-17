import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Mail, CalendarDays, Send, MessageCircle, Check, Loader2, ArrowRight, Workflow } from 'lucide-react';
import { useApp } from '../store/AppContext';
import type { AppId } from '../types';

const appMeta: Record<AppId, { icon: typeof Mail; color: string; desc: string }> = {
  gmail: { icon: Mail, color: 'bg-red-50 text-red-500 dark:bg-red-500/10', desc: 'Sync and automate your email inbox.' },
  gcal: { icon: CalendarDays, color: 'bg-blue-50 text-blue-500 dark:bg-blue-500/10', desc: 'Keep meetings and classes in sync.' },
  telegram: { icon: Send, color: 'bg-sky-50 text-sky-500 dark:bg-sky-500/10', desc: 'Get automation alerts via Telegram.' },
  whatsapp: { icon: MessageCircle, color: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10', desc: 'Receive reminders on WhatsApp.' },
};

export default function ConnectApps() {
  const { user, connections, toggleConnection, pushToast } = useApp();
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState<AppId | null>(null);

  if (!user?.loggedIn) return <Navigate to="/" replace />;

  function handleToggle(id: AppId, connected: boolean) {
    if (connected) {
      toggleConnection(id);
      pushToast(`Disconnected from ${appMeta[id] ? id : id}`, 'info');
      return;
    }
    setConnecting(id);
    setTimeout(() => {
      toggleConnection(id);
      setConnecting(null);
      pushToast('Simulated connection established (Demo Mode)', 'success');
    }, 700);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white mb-6">
        <Workflow size={20} />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Connect your apps</h1>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 text-center max-w-md">
        These are simulated connections for demo purposes — no real accounts are accessed or authenticated.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-3 w-full max-w-xl">
        {connections.map((c) => {
          const meta = appMeta[c.id];
          const Icon = meta.icon;
          const isConnecting = connecting === c.id;
          return (
            <div
              key={c.id}
              className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white text-sm">{c.name}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{meta.desc}</p>
              </div>
              <button
                onClick={() => handleToggle(c.id, c.connected)}
                disabled={isConnecting}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  c.connected
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {isConnecting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : c.connected ? (
                  <Check size={13} />
                ) : null}
                {isConnecting ? 'Connecting' : c.connected ? 'Connected' : 'Connect'}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-400 mt-4 inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Simulated Connection — Demo Mode
      </p>

      <button
        onClick={() => navigate('/dashboard')}
        className="mt-7 flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors"
      >
        Continue to Dashboard <ArrowRight size={16} />
      </button>
    </div>
  );
}
