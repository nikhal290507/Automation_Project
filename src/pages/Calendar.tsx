import { useState, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight, Trash2, Pencil, X } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Badge, EmptyState } from '../components/Common';
import ConfirmDialog from '../components/ConfirmDialog';
import type { CalendarEvent, EventCategory } from '../types';

const catTone: Record<EventCategory, 'brand' | 'purple' | 'green' | 'red' | 'slate'> = {
  Meeting: 'brand', Class: 'purple', Personal: 'green', Deadline: 'red', Other: 'slate',
};

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day;
  return new Date(date.setDate(diff));
}

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

const emptyForm = { title: '', date: fmtDate(new Date()), startTime: '09:00', endTime: '10:00', category: 'Meeting' as EventCategory, notes: '' };

export default function CalendarPage() {
  const { events, addEvent, updateEvent, deleteEvent, pushToast } = useApp();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<CalendarEvent | null>(null);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  }), [weekStart]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    days.forEach((d) => { map[fmtDate(d)] = []; });
    events.forEach((e) => { if (map[e.date]) map[e.date].push(e); });
    Object.values(map).forEach((list) => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return map;
  }, [events, days]);

  function openNew(date?: string) {
    setEditing(null);
    setForm({ ...emptyForm, date: date || fmtDate(new Date()) });
    setShowForm(true);
  }

  function openEdit(e: CalendarEvent) {
    setEditing(e);
    setForm({ title: e.title, date: e.date, startTime: e.startTime, endTime: e.endTime, category: e.category, notes: e.notes || '' });
    setShowForm(true);
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.title.trim()) return;
    if (editing) {
      updateEvent(editing.id, form);
      pushToast('Event updated');
    } else {
      addEvent(form);
      pushToast('Event added');
    }
    setShowForm(false);
  }

  function confirmDelete() {
    if (pendingDelete) {
      deleteEvent(pendingDelete.id);
      pushToast('Event deleted');
      setPendingDelete(null);
    }
  }

  const todayStr = fmtDate(new Date());

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Calendar</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {weekStart.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} – {days[6].toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button onClick={() => setWeekStart((w) => { const d = new Date(w); d.setDate(d.getDate() - 7); return d; })} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="px-2.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              Today
            </button>
            <button onClick={() => setWeekStart((w) => { const d = new Date(w); d.setDate(d.getDate() + 7); return d; })} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
              <ChevronRight size={16} />
            </button>
          </div>
          <button onClick={() => openNew()} className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
            <Plus size={15} /> Add Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {days.map((d) => {
          const key = fmtDate(d);
          const dayEvents = eventsByDay[key] || [];
          const isToday = key === todayStr;
          return (
            <Card key={key} className={`p-3 min-h-[180px] flex flex-col ${isToday ? 'ring-2 ring-brand-400 dark:ring-brand-500' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase">{d.toLocaleDateString(undefined, { weekday: 'short' })}</p>
                  <p className={`text-sm font-bold ${isToday ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-slate-100'}`}>{d.getDate()}</p>
                </div>
                <button onClick={() => openNew(key)} className="text-slate-300 hover:text-brand-500 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex-1 space-y-1.5 overflow-y-auto">
                {dayEvents.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => openEdit(e)}
                    className="w-full text-left rounded-lg bg-slate-50 dark:bg-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 transition-colors"
                  >
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate">{e.title}</p>
                    <p className="text-[11px] text-slate-400">{e.startTime}</p>
                    <Badge tone={catTone[e.category]}>{e.category}</Badge>
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {events.length === 0 && <EmptyState title="No events yet" description="Add your first meeting, class, or deadline." />}

      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowForm(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-popover p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">{editing ? 'Edit Event' : 'New Event'}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Date</label>
                  <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as EventCategory })} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none">
                    {(['Meeting', 'Class', 'Personal', 'Deadline', 'Other'] as EventCategory[]).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Start time</label>
                  <input required type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">End time</label>
                  <input required type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-5">
              {editing ? (
                <button type="button" onClick={() => { setPendingDelete(editing); setShowForm(false); }} className="text-rose-500 text-sm font-medium inline-flex items-center gap-1.5 hover:underline">
                  <Trash2 size={14} /> Delete
                </button>
              ) : <span />}
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-3.5 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 text-sm rounded-lg bg-brand-600 hover:bg-brand-700 text-white inline-flex items-center gap-1.5">
                  {editing ? <Pencil size={13} /> : <Plus size={13} />} {editing ? 'Save' : 'Add Event'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this event?"
        description={`"${pendingDelete?.title}" will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
