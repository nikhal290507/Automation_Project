import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Toaster from './Toaster';
import { useApp } from '../store/AppContext';
import MobileNav from './MobileNav';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/inbox': 'Inbox',
  '/calendar': 'Calendar',
  '/automations': 'Automations',
  '/focus': 'Focus Mode',
  '/tasks': 'Tasks',
  '/activity': 'Activity',
  '/settings': 'Settings',
};

export default function DashboardLayout() {
  const { user } = useApp();
  const location = useLocation();

  if (!user || !user.loggedIn) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Topbar title={titles[location.pathname] || 'AutoFlow'} />
        <main className="flex-1 p-4 md:p-6 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <Toaster />
    </div>
  );
}
