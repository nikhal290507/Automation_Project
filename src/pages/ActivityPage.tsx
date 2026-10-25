import { useState } from 'react';
import { Trash2, Zap, Timer, CalendarDays, CheckSquare, Plug, Settings as SettingsIcon, Activity as ActivityIcon } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, EmptyState } from '../components/Common';
import ConfirmDialog from '../components/ConfirmDialog';
import type { ActivityLog } from '../types';

const iconFor: Record<ActivityLog['type'], typeof Zap> = {
  automation: Zap, focus: Timer, calendar: CalendarDays, task: CheckSquare, connection: Plug, system: SettingsIcon,
};
const colorFor: Record<ActivityLog['type'], string> = {
  automation: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10',
  focus: 'text-brand-500 bg-brand-50 dark:bg-brand-500/10',
  calendar: 'text-sky-500 bg-sky-50 dark:bg-sky-500/10',
  task: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
  connection: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10',
  system: 'text-slate-500 bg-slate-100 dark:bg-slate-700',
};

export default function ActivityPage() {
  const { activity, clearActivity, pushToast } = useApp();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleClear() {
    clearActivity();
    pushToast('Activity log cleared');
    setConfirmOpen(false);
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Activity</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">A log of everything AutoFlow has done automatically.</p>
        </div>
        {activity.length > 0 && (
          <button onClick={() => setConfirmOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Trash2 size={14} /> Clear Activity
          </button>
        )}
      </div>

      <Card>
        {activity.length === 0 ? (
          <EmptyState icon={<ActivityIcon size={20} />} title="No activity yet" description="Actions from automations, focus mode, and more will show up here." />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {activity.map((a) => {
              const Icon = iconFor[a.type];
              return (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorFor[a.type]}`}>
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700 dark:text-slate-200">{a.message}</p>
                  </div>
                  <p className="text-xs text-slate-400 shrink-0">
                    {new Date(a.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Clear all activity?"
        description="This will permanently remove your entire activity log."
        confirmLabel="Clear"
        onConfirm={handleClear}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
