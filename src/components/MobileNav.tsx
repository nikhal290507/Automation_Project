import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Inbox, CalendarDays, Zap, CheckSquare } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/inbox', label: 'Inbox', icon: Inbox },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/automations', label: 'Auto', icon: Zap },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around h-16">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium flex-1 h-full ${
              isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
