import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useApp } from '../store/AppContext';

const icons = {
  success: <CheckCircle2 size={18} className="text-emerald-500" />,
  error: <XCircle size={18} className="text-rose-500" />,
  info: <Info size={18} className="text-brand-500" />,
};

export default function Toaster() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-slide-in flex items-start gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-popover px-4 py-3"
        >
          {icons[t.kind]}
          <p className="flex-1 text-sm text-slate-700 dark:text-slate-200">{t.message}</p>
          <button onClick={() => dismissToast(t.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
