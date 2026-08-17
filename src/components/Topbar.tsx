import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Sun, Moon, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';

export default function Topbar({ title }: { title: string }) {
  const { user, theme, toggleTheme, logout, emails, activity } = useApp();
  const [query, setQuery] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const importantUnread = emails.filter((e) => e.important && !e.read && !e.archived);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) navigate(`/inbox?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="h-16 sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center gap-4 px-4 md:px-6">
      <h1 className="font-semibold text-slate-900 dark:text-white text-lg hidden md:block whitespace-nowrap">{title}</h1>
      <form onSubmit={onSearchSubmit} className="flex-1 max-w-md relative ml-auto md:ml-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search emails, tasks, events..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-brand-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-500/20 transition-colors"
        />
      </form>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
          title="Toggle theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs((s) => !s)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 relative transition-colors"
          >
            <Bell size={18} />
            {importantUnread.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>
          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-popover animate-fade-in overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 font-medium text-sm text-slate-800 dark:text-slate-100">
                Notifications
              </div>
              <div className="max-h-72 overflow-y-auto">
                {importantUnread.length === 0 && activity.length === 0 && (
                  <p className="px-4 py-6 text-sm text-slate-400 text-center">You're all caught up.</p>
                )}
                {importantUnread.slice(0, 4).map((e) => (
                  <div key={e.id} className="px-4 py-2.5 text-sm border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{e.subject}</p>
                    <p className="text-xs text-slate-400 truncate">{e.sender}</p>
                  </div>
                ))}
                {activity.slice(0, 4).map((a) => (
                  <div key={a.id} className="px-4 py-2.5 text-sm border-b border-slate-50 dark:border-slate-700/50 last:border-0 text-slate-600 dark:text-slate-300">
                    {a.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button onClick={() => setShowProfile((s) => !s)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ backgroundColor: user?.avatarColor || '#6366f1' }}
            >
              {(user?.name || 'D U').split(' ').map((p) => p[0]).slice(0, 2).join('')}
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-popover animate-fade-in overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40"
              >
                Settings
              </button>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2"
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
