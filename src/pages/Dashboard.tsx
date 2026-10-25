import { Link } from 'react-router-dom';
import {
  Mail, AlertCircle, CalendarClock, Zap, ArrowRight, Star, Archive as ArchiveIcon,
  PlusCircle, Timer, Play, ListChecks, TrendingUp,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Badge, categoryTone, EmptyState } from '../components/Common';

export default function Dashboard() {
  const { user, emails, events, automations, tasks, runAutomations, pushToast } = useApp();

  const activeEmails = emails.filter((e) => !e.archived);
  const importantCount = activeEmails.filter((e) => e.important).length;
  const enabledAutomations = automations.filter((a) => a.enabled).length;

  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = events
    .filter((e) => e.date >= today)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .slice(0, 4);

  const recentEmails = [...activeEmails]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5);

  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.length - completedTasks;
  const productivity = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const stats = [
    { label: 'Total Emails', value: activeEmails.length, icon: Mail, tone: 'text-brand-600 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-400' },
    { label: 'Important', value: importantCount, icon: AlertCircle, tone: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400' },
    { label: 'Meetings', value: upcomingEvents.length, icon: CalendarClock, tone: 'text-sky-600 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-400' },
    { label: 'Automations', value: enabledAutomations, icon: Zap, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400' },
  ];

  function handleRun() {
    const count = runAutomations();
    pushToast(count > 0 ? `Automations ran — ${count} update${count === 1 ? '' : 's'} applied.` : 'Automations ran — nothing new to update.', 'success');
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Here's what's happening across your workspace today.</p>
        </div>
        <button
          onClick={handleRun}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          <Zap size={15} /> Run All Automations
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.tone}`}>
                <s.icon size={17} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3">{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Recent Emails</h3>
            <Link to="/inbox" className="text-xs font-medium text-brand-600 dark:text-brand-400 inline-flex items-center gap-1 hover:underline">
              View Inbox <ArrowRight size={12} />
            </Link>
          </div>
          {recentEmails.length === 0 ? (
            <EmptyState icon={<Mail size={20} />} title="No emails yet" />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentEmails.map((e) => (
                <Link
                  key={e.id}
                  to="/inbox"
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-500 dark:text-slate-300 shrink-0">
                    {e.sender.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate ${!e.read ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                        {e.sender}
                      </p>
                      {e.important && <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{e.subject}</p>
                  </div>
                  <Badge tone={categoryTone(e.category)}>{e.category}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Upcoming Meetings</h3>
            <Link to="/calendar" className="text-xs font-medium text-brand-600 dark:text-brand-400 inline-flex items-center gap-1 hover:underline">
              Calendar <ArrowRight size={12} />
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <EmptyState icon={<CalendarClock size={20} />} title="No upcoming events" />
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((e) => (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex flex-col items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                    <span className="text-[10px] font-medium leading-none">{new Date(e.date).toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}</span>
                    <span className="text-sm font-bold leading-none mt-0.5">{new Date(e.date).getDate()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{e.title}</p>
                    <p className="text-xs text-slate-400">{e.startTime} – {e.endTime}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Active Automations</h3>
            <Link to="/automations" className="text-xs font-medium text-brand-600 dark:text-brand-400 inline-flex items-center gap-1 hover:underline">
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          {automations.filter((a) => a.enabled).length === 0 ? (
            <EmptyState icon={<Zap size={20} />} title="No active automations" />
          ) : (
            <div className="space-y-2.5">
              {automations.filter((a) => a.enabled).slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-200 truncate">{a.name}</span>
                  <span className="text-xs text-slate-400 shrink-0 ml-2">{a.timesTriggered}× run</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2.5">
            <Link to="/tasks" className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 transition-colors text-center">
              <PlusCircle size={18} className="text-brand-600 dark:text-brand-400" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Add Task</span>
            </Link>
            <Link to="/focus" className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 transition-colors text-center">
              <Timer size={18} className="text-brand-600 dark:text-brand-400" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Start Focus</span>
            </Link>
            <Link to="/automations" className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 transition-colors text-center">
              <Play size={18} className="text-brand-600 dark:text-brand-400" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">New Rule</span>
            </Link>
            <Link to="/inbox" className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 transition-colors text-center">
              <ArchiveIcon size={18} className="text-brand-600 dark:text-brand-400" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Clean Inbox</span>
            </Link>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-1.5">
            <TrendingUp size={15} /> Productivity Summary
          </h3>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0">
              <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-100 dark:text-slate-700" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3"
                  strokeDasharray={`${productivity} 100`} strokeLinecap="round"
                  className="text-brand-600 dark:text-brand-400"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-800 dark:text-white">{productivity}%</span>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <ListChecks size={13} className="text-emerald-500" /> {completedTasks} tasks completed
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <ListChecks size={13} className="text-amber-500" /> {pendingTasks} tasks pending
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
