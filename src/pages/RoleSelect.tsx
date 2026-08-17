import { useNavigate, Navigate } from 'react-router-dom';
import { GraduationCap, Briefcase, Workflow, ArrowRight } from 'lucide-react';
import { useApp } from '../store/AppContext';
import type { Role } from '../types';

export default function RoleSelect() {
  const { user, setRole } = useApp();
  const navigate = useNavigate();

  if (!user?.loggedIn) return <Navigate to="/" replace />;

  function choose(role: Role) {
    setRole(role);
    navigate('/connect');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white mb-6">
        <Workflow size={20} />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center">How will you use AutoFlow?</h1>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">
        We'll tailor default automations and demo data to fit your workflow.
      </p>

      <div className="mt-9 grid sm:grid-cols-2 gap-4 w-full max-w-xl">
        {[
          { role: 'student' as Role, icon: GraduationCap, title: 'Student', desc: 'Manage classes, assignments, and campus emails.' },
          { role: 'professional' as Role, icon: Briefcase, title: 'Professional', desc: 'Automate work email, meetings, and tasks.' },
        ].map(({ role, icon: Icon, title, desc }) => (
          <button
            key={role}
            onClick={() => choose(role)}
            className="group text-left p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-card transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
              <Icon size={22} />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{desc}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              Continue <ArrowRight size={14} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
