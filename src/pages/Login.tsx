import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Workflow, Mail, Lock, ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../store/AppContext';

export default function Login() {
  const { user, login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user?.loggedIn) return <Navigate to="/dashboard" replace />;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(email.trim() || 'demo@autoflow.app');
      setLoading(false);
      navigate('/role');
    }, 500);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-slate-950">
      {/* Left: brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-brand-600 to-brand-800 text-white p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
            <Workflow size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight">AutoFlow</span>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight">Your inbox and schedule, running on autopilot.</h2>
          <p className="mt-4 text-brand-100 text-sm leading-relaxed">
            Automate email triage, track meetings, and stay focused — all in one clean workspace built for students and professionals.
          </p>
          <div className="mt-8 space-y-3">
            {[
              { icon: Sparkles, text: 'Smart automation rules for your inbox' },
              { icon: ShieldCheck, text: 'Everything stored privately in your browser' },
              { icon: Zap, text: 'Focus sessions that mute the noise' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-brand-50">
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <Icon size={14} />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-brand-200">© 2026 AutoFlow. Demo product — no real accounts involved.</p>
      </div>

      {/* Right: form */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Workflow size={20} />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">AutoFlow</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Sign in to your workspace. This is a demo — any email and password will work.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-500/20 focus:border-brand-400 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-500/20 focus:border-brand-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-70 text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-5 flex items-center gap-2 text-xs text-slate-400 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            Demo Mode — no real authentication is performed
          </div>
        </div>
      </div>
    </div>
  );
}
