import { useState, useMemo } from 'react';
import { Plus, Trash2, CheckSquare, Square, X } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Badge, EmptyState } from '../components/Common';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Task } from '../types';

const priorityTone: Record<Task['priority'], 'red' | 'amber' | 'blue'> = { High: 'red', Medium: 'amber', Low: 'blue' };

export default function Tasks() {
  const { tasks, addTask, toggleTask, deleteTask, pushToast } = useApp();
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);

  const filtered = useMemo(() => {
    let list = tasks;
    if (filter === 'active') list = list.filter((t) => !t.completed);
    if (filter === 'completed') list = list.filter((t) => t.completed);
    return [...list].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasks, filter]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({ title, priority, dueDate, completed: false });
    pushToast('Task added');
    setTitle('');
    setShowForm(false);
  }

  function confirmDelete() {
    if (pendingDelete) {
      deleteTask(pendingDelete.id);
      pushToast('Task deleted');
      setPendingDelete(null);
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tasks</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{tasks.filter((t) => !t.completed).length} active task{tasks.filter((t) => !t.completed).length === 1 ? '' : 's'}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
          <Plus size={15} /> Add Task
        </button>
      </div>

      <div className="flex gap-1.5">
        {(['active', 'completed', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              filter === f ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={<CheckSquare size={20} />} title="No tasks here" description="You're all clear." />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filtered.map((t) => {
              const overdue = !t.completed && t.dueDate < new Date().toISOString().slice(0, 10);
              return (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3.5">
                  <button onClick={() => toggleTask(t.id)} className="shrink-0 text-slate-400 hover:text-brand-600">
                    {t.completed ? <CheckSquare size={19} className="text-brand-600" /> : <Square size={19} />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${t.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100 font-medium'}`}>{t.title}</p>
                    <p className={`text-xs mt-0.5 ${overdue ? 'text-rose-500 font-medium' : 'text-slate-400'}`}>
                      Due {new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} {overdue && '· Overdue'}
                    </p>
                  </div>
                  <Badge tone={priorityTone[t.priority]}>{t.priority}</Badge>
                  <button onClick={() => setPendingDelete(t)} className="shrink-0 text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowForm(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-popover p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">New Task</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Task</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none">
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Due date</label>
                  <input required type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none" />
                </div>
              </div>
            </div>
            <button type="submit" className="w-full mt-5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">Add Task</button>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this task?"
        description={`"${pendingDelete?.title}" will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
