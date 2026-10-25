import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Inbox, CalendarDays, Zap, Timer, CheckSquare, Activity, Settings, Workflow,
} from 'lucide-react';
import { useApp } from '../store/AppContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inbox', label: 'Inbox', icon: Inbox },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/automations', label: 'Automations', icon: Zap },
  { to: '/focus', label: 'Focus Mode', icon: Timer },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { emails, focusSessions } = useApp();
  const unread = emails.filter((e) => !e.read && !e.archived).length;
  const focusActive = focusSessions.some((f) => f.active);

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-slate-200 dark:border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
          <Workflow size={18} />
        </div>
        <span className="font-bold text-slate-900 dark:text-white tracking-tight">AutoFlow</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <Icon size={17} />
            <span>{label}</span>
            {label === 'Inbox' && unread > 0 && (
              <span className="ml-auto text-[11px] font-semibold bg-brand-600 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {unread}
              </span>
            )}
            {label === 'Focus Mode' && focusActive && (
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5 font-medium text-brand-600 dark:text-brand-400">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Demo Mode
          </span>
          <p className="mt-1 leading-snug">All data lives in your browser only.</p>
        </div>
      </div>
    </aside>
  );
}
