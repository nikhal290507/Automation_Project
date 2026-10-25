import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'brand' | 'green' | 'red' | 'amber' | 'blue' | 'purple' }) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    brand: 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    red: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    blue: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-4">
      <div className="rounded-full bg-slate-100 dark:bg-slate-700 p-4 text-slate-400 dark:text-slate-500 mb-3">
        {icon || <Inbox size={22} />}
      </div>
      <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">{title}</p>
      {description && <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs">{description}</p>}
    </div>
  );
}

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-slate-300 border-t-brand-600 dark:border-slate-600"
      style={{ width: size, height: size }}
    />
  );
}

export function categoryTone(category: string): 'slate' | 'brand' | 'green' | 'red' | 'amber' | 'blue' | 'purple' {
  switch (category) {
    case 'Important': return 'red';
    case 'Work': return 'blue';
    case 'College': return 'purple';
    case 'Meetings': return 'brand';
    case 'Promotions': return 'amber';
    case 'Spam': return 'slate';
    default: return 'slate';
  }
}
