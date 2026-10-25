import { useState, useEffect, useMemo } from 'react';
import { Timer, Plus, X, BellOff, Square, Trash2 } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, EmptyState } from '../components/Common';

function pad(n: number) { return n.toString().padStart(2, '0'); }

export default function Focus() {
  const { focusSessions, events, startFocusSession, endFocusSession, deleteFocusSession, notificationPrefs, pushToast } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [durationMin, setDurationMin] = useState(25);
  const [linkedEventId, setLinkedEventId] = useState('');
  const [, setTick] = useState(0);

  const active = focusSessions.find((f) => f.active);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [active]);

  useEffect(() => {
    if (active && new Date(active.endTime).getTime() <= Date.now()) {
      endFocusSession(active.id);
      pushToast('Focus session complete 🎉', 'success');
    }
  }, [active, endFocusSession, pushToast]);

  const remaining = useMemo(() => {
    if (!active) return null;
    const ms = Math.max(0, new Date(active.endTime).getTime() - Date.now());
    const totalSec = Math.floor(ms / 1000);
    return { h: Math.floor(totalSec / 3600), m: Math.floor((totalSec % 3600) / 60), s: totalSec % 60 };
  }, [active]);

  function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const start = new Date();
    const end = new Date(start.getTime() + durationMin * 60000);
    startFocusSession({ title, startTime: start.toISOString(), endTime: end.toISOString(), linkedEventId: linkedEventId || undefined });
    pushToast('Focus Mode started — notifications muted');
    setShowForm(false);
    setTitle('');
    setLinkedEventId('');
  }

  const upcomingEvents = events.filter((e) => e.date >= new Date().toISOString().slice(0, 10));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Focus Mode</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Block distractions and stay in the zone.</p>
        </div>
        {!active && (
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
            <Plus size={15} /> New Session
          </button>
        )}
      </div>

      {active && remaining ? (
        <Card className="p-8 flex flex-col items-center text-center bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0">
          <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> Focus Mode Active
          </div>
          <h3 className="text-lg font-semibold">{active.title}</h3>
          <div className="text-5xl font-bold tracking-tight mt-4 font-mono">
            {remaining.h > 0 && `${pad(remaining.h)}:`}{pad(remaining.m)}:{pad(remaining.s)}
          </div>
          {notificationPrefs.focusModeMutes && (
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-brand-100">
              <BellOff size={14} /> Notifications muted for this session
            </p>
          )}
          <button
            onClick={() => { endFocusSession(active.id); pushToast('Focus session ended', 'info'); }}
            className="mt-6 inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Square size={14} /> End Session
          </button>
        </Card>
      ) : (
        <Card><EmptyState icon={<Timer size={20} />} title="No active focus session" description="Start one to mute notifications and lock in." /></Card>
      )}

      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">Session History</h3>
        {focusSessions.filter((f) => !f.active).length === 0 ? (
          <Card><EmptyState title="No past sessions yet" /></Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {focusSessions.filter((f) => !f.active).map((f) => (
              <Card key={f.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{f.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(f.startTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button onClick={() => deleteFocusSession(f.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                  <Trash2 size={15} />
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowForm(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={handleStart} className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-popover p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">New Focus Session</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Session title</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Deep work: report" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-500/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Duration (minutes)</label>
                <input required type="number" min={1} max={240} value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Link to meeting/class (optional)</label>
                <select value={linkedEventId} onChange={(e) => setLinkedEventId(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none">
                  <option value="">None</option>
                  {upcomingEvents.map((e) => <option key={e.id} value={e.id}>{e.title} — {e.date}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="w-full mt-5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
              Start Focus Session
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
