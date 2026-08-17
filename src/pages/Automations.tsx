import { useState } from 'react';
import { Plus, Zap, Trash2, Pencil, X, Play, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Badge, EmptyState } from '../components/Common';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Automation, ConditionType, ActionType, EmailCategory } from '../types';

const conditionLabels: Record<ConditionType, string> = {
  senderContains: 'Sender contains',
  subjectContains: 'Subject contains',
  category: 'Email category is',
  keywordContains: 'Keyword contains',
};
const actionLabels: Record<ActionType, string> = {
  markImportant: 'Mark as Important',
  moveToCategory: 'Move to category',
  markSpam: 'Mark as Spam',
  archive: 'Archive email',
  createTask: 'Create a task',
};
const categories: EmailCategory[] = ['Important', 'Work', 'College', 'Meetings', 'Promotions', 'Spam', 'Other'];

const emptyForm = {
  name: '',
  conditionType: 'subjectContains' as ConditionType,
  conditionValue: '',
  actionType: 'markImportant' as ActionType,
  actionValue: '',
};

export default function Automations() {
  const { automations, addAutomation, updateAutomation, deleteAutomation, toggleAutomation, runAutomations, pushToast } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Automation | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<Automation | null>(null);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(a: Automation) {
    setEditing(a);
    setForm({
      name: a.name,
      conditionType: a.condition.type,
      conditionValue: a.condition.value,
      actionType: a.action.type,
      actionValue: a.action.value || '',
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.conditionValue.trim()) return;
    const payload = {
      name: form.name,
      condition: { type: form.conditionType, value: form.conditionValue },
      action: { type: form.actionType, value: form.actionValue || undefined },
      enabled: true,
    };
    if (editing) {
      updateAutomation(editing.id, payload);
      pushToast('Automation updated');
    } else {
      addAutomation(payload);
      pushToast('Automation created');
    }
    setShowForm(false);
  }

  function confirmDelete() {
    if (pendingDelete) {
      deleteAutomation(pendingDelete.id);
      pushToast('Automation deleted');
      setPendingDelete(null);
    }
  }

  function handleRunAll() {
    const count = runAutomations();
    pushToast(count > 0 ? `${count} action${count === 1 ? '' : 's'} applied across your inbox.` : 'No matching emails found.', count > 0 ? 'success' : 'info');
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Automations</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{automations.length} rule{automations.length === 1 ? '' : 's'} configured</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRunAll} className="inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium px-3.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Play size={14} /> Run All Automations
          </button>
          <button onClick={openNew} className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
            <Plus size={15} /> New Automation
          </button>
        </div>
      </div>

      {automations.length === 0 ? (
        <Card><EmptyState icon={<Zap size={20} />} title="No automations yet" description="Create your first IF → THEN rule to start automating your inbox." /></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {automations.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${a.enabled ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-700'}`}>
                    <Zap size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{a.name}</p>
                    <p className="text-xs text-slate-400">{a.timesTriggered} time{a.timesTriggered === 1 ? '' : 's'} triggered</p>
                  </div>
                </div>
                <button onClick={() => toggleAutomation(a.id)} className="shrink-0">
                  {a.enabled ? <ToggleRight size={26} className="text-brand-600" /> : <ToggleLeft size={26} className="text-slate-300 dark:text-slate-600" />}
                </button>
              </div>

              <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 space-y-1">
                <p><span className="font-semibold text-slate-600 dark:text-slate-300">IF</span> {conditionLabels[a.condition.type]} <span className="font-medium text-slate-700 dark:text-slate-200">"{a.condition.value}"</span></p>
                <p><span className="font-semibold text-slate-600 dark:text-slate-300">THEN</span> {actionLabels[a.action.type]}{a.action.value ? <> <span className="font-medium text-slate-700 dark:text-slate-200">"{a.action.value}"</span></> : null}</p>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => openEdit(a)} className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 inline-flex items-center gap-1.5">
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => setPendingDelete(a)} className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 inline-flex items-center gap-1.5">
                  <Trash2 size={12} /> Delete
                </button>
                {!a.enabled && <Badge tone="slate">Disabled</Badge>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowForm(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-popover p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">{editing ? 'Edit Automation' : 'New Automation'}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Automation name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Flag urgent emails" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-500/20" />
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-2">IF</p>
                <div className="grid grid-cols-2 gap-2">
                  <select value={form.conditionType} onChange={(e) => setForm({ ...form, conditionType: e.target.value as ConditionType, conditionValue: '' })} className="px-2.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none">
                    {Object.entries(conditionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  {form.conditionType === 'category' ? (
                    <select required value={form.conditionValue} onChange={(e) => setForm({ ...form, conditionValue: e.target.value })} className="px-2.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none">
                      <option value="">Select...</option>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <input required value={form.conditionValue} onChange={(e) => setForm({ ...form, conditionValue: e.target.value })} placeholder="value..." className="px-2.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none" />
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">THEN</p>
                <div className="grid grid-cols-2 gap-2">
                  <select value={form.actionType} onChange={(e) => setForm({ ...form, actionType: e.target.value as ActionType, actionValue: '' })} className="px-2.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none">
                    {Object.entries(actionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  {form.actionType === 'moveToCategory' ? (
                    <select required value={form.actionValue} onChange={(e) => setForm({ ...form, actionValue: e.target.value })} className="px-2.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none">
                      <option value="">Select...</option>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : form.actionType === 'createTask' ? (
                    <input value={form.actionValue} onChange={(e) => setForm({ ...form, actionValue: e.target.value })} placeholder="Task title (optional)" className="px-2.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none" />
                  ) : (
                    <div className="px-2.5 py-2 text-xs text-slate-400 flex items-center">No value needed</div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button type="button" onClick={() => setShowForm(false)} className="px-3.5 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
              <button type="submit" className="px-3.5 py-1.5 text-sm rounded-lg bg-brand-600 hover:bg-brand-700 text-white inline-flex items-center gap-1.5">
                {editing ? <Pencil size={13} /> : <Plus size={13} />} {editing ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this automation?"
        description={`"${pendingDelete?.name}" will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
