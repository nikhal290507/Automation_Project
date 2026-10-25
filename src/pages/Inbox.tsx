import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Star, Archive, Trash2, ShieldAlert, X, ChevronDown, ArrowUpDown, Search,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Badge, categoryTone, EmptyState } from '../components/Common';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Email, EmailCategory } from '../types';

const categories: (EmailCategory | 'All')[] = ['All', 'Important', 'Work', 'College', 'Meetings', 'Promotions', 'Spam', 'Other'];
type SortKey = 'newest' | 'oldest' | 'sender';

export default function Inbox() {
  const { emails, markImportant, markSpam, archiveEmail, deleteEmail, markRead, pushToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState<EmailCategory | 'All'>('All');
  const [sort, setSort] = useState<SortKey>('newest');
  const [showArchived, setShowArchived] = useState(false);
  const [selected, setSelected] = useState<Email | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Email | null>(null);

  const filtered = useMemo(() => {
    let list = emails.filter((e) => (showArchived ? e.archived : !e.archived));
    if (category !== 'All') list = list.filter((e) => e.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) => e.subject.toLowerCase().includes(q) || e.sender.toLowerCase().includes(q) || e.preview.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      if (sort === 'newest') return b.timestamp.localeCompare(a.timestamp);
      if (sort === 'oldest') return a.timestamp.localeCompare(b.timestamp);
      return a.sender.localeCompare(b.sender);
    });
    return list;
  }, [emails, category, query, sort, showArchived]);

  function openEmail(e: Email) {
    setSelected(e);
    if (!e.read) markRead(e.id);
  }

  function confirmDelete() {
    if (pendingDelete) {
      deleteEmail(pendingDelete.id);
      pushToast('Email deleted', 'success');
      if (selected?.id === pendingDelete.id) setSelected(null);
      setPendingDelete(null);
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Inbox</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{filtered.length} {showArchived ? 'archived' : 'active'} email{filtered.length === 1 ? '' : 's'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchived((s) => !s)}
            className={`text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${
              showArchived ? 'bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-500/10 dark:border-brand-500/30 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {showArchived ? 'Viewing Archived' : 'View Archived'}
          </button>
        </div>
      </div>

      <Card className="p-3">
        <div className="flex flex-col md:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSearchParams(e.target.value ? { q: e.target.value } : {}); }}
              placeholder="Search by sender or subject..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-500/20 focus:border-brand-400"
            />
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="sender">Sender A–Z</option>
            </select>
            <ArrowUpDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === c
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState title="No emails found" description="Try adjusting your filters or search terms." />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filtered.map((e) => (
              <div
                key={e.id}
                onClick={() => openEmail(e)}
                className="flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-500 dark:text-slate-300 shrink-0 mt-0.5">
                  {e.sender.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm ${!e.read ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{e.sender}</p>
                    <Badge tone={categoryTone(e.category)}>{e.category}</Badge>
                    {!e.read && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                  </div>
                  <p className={`text-sm truncate mt-0.5 ${!e.read ? 'text-slate-800 dark:text-slate-100 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>{e.subject}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{e.preview}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(ev) => { ev.stopPropagation(); markImportant(e.id); pushToast(e.important ? 'Removed from Important' : 'Marked as Important'); }} title="Mark important" className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">
                    <Star size={15} className={e.important ? 'text-amber-400 fill-amber-400' : 'text-slate-400'} />
                  </button>
                  <button onClick={(ev) => { ev.stopPropagation(); markSpam(e.id); pushToast(e.spam ? 'Unmarked as spam' : 'Marked as spam'); }} title="Mark spam" className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">
                    <ShieldAlert size={15} className={e.spam ? 'text-rose-500' : 'text-slate-400'} />
                  </button>
                  <button onClick={(ev) => { ev.stopPropagation(); archiveEmail(e.id); pushToast(e.archived ? 'Unarchived' : 'Archived'); }} title="Archive" className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">
                    <Archive size={15} className="text-slate-400" />
                  </button>
                  <button onClick={(ev) => { ev.stopPropagation(); setPendingDelete(e); }} title="Delete" className="p-1.5 rounded-md hover:bg-rose-100 dark:hover:bg-rose-500/10">
                    <Trash2 size={15} className="text-slate-400 hover:text-rose-500" />
                  </button>
                </div>
                <ChevronDown size={14} className="text-slate-300 -rotate-90 shrink-0 mt-2 hidden sm:block" />
              </div>
            ))}
          </div>
        )}
      </Card>

      {selected && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-popover" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-700">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone={categoryTone(selected.category)}>{selected.category}</Badge>
                  {selected.important && <Badge tone="red">Important</Badge>}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mt-2">{selected.subject}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{selected.sender} &lt;{selected.senderEmail}&gt;</p>
                <p className="text-xs text-slate-400 mt-0.5">{new Date(selected.timestamp).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {selected.body}
            </div>
            <div className="flex flex-wrap gap-2 p-5 pt-0">
              <button onClick={() => markImportant(selected.id)} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 inline-flex items-center gap-1.5">
                <Star size={13} className={selected.important ? 'text-amber-400 fill-amber-400' : ''} /> {selected.important ? 'Unmark Important' : 'Mark Important'}
              </button>
              <button onClick={() => archiveEmail(selected.id)} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 inline-flex items-center gap-1.5">
                <Archive size={13} /> {selected.archived ? 'Unarchive' : 'Archive'}
              </button>
              <button onClick={() => setPendingDelete(selected)} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 inline-flex items-center gap-1.5">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this email?"
        description={`"${pendingDelete?.subject}" will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
