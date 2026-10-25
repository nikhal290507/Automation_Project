import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "../../lib/utils";

type ToastTone = "success" | "error" | "info";
type ToastMessage = { id: number; message: string; tone: ToastTone };
type ToastContextValue = { toast: (message: string, tone?: ToastTone) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastItem({ item, onDismiss }: { item: ToastMessage; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(item.id), 3600);
    return () => window.clearTimeout(timer);
  }, [item.id, onDismiss]);

  const Icon = item.tone === "success" ? CheckCircle2 : item.tone === "error" ? AlertCircle : Info;
  const toneClass = {
    success: "border-state-success/30 text-state-success",
    error: "border-state-danger/30 text-state-danger",
    info: "border-accent-blue/30 text-accent-blue",
  }[item.tone];

  return (
    <div
      className={cn("flex max-w-sm items-start gap-3 rounded-xl border bg-surface-raised px-4 py-3 shadow-card", toneClass)}
      role={item.tone === "error" ? "alert" : "status"}
    >
      <Icon size={17} className="mt-0.5 shrink-0" />
      <p className="flex-1 text-sm text-ink">{item.message}</p>
      <button onClick={() => onDismiss(item.id)} aria-label="Dismiss notification" className="text-ink-faint hover:text-ink">
        <X size={15} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastMessage[]>([]);
  const toast = useCallback((message: string, tone: ToastTone = "success") => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current, { id, message, tone }]);
  }, []);
  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex flex-col gap-2" aria-live="polite">
        {items.map((item) => <div className="pointer-events-auto" key={item.id}><ToastItem item={item} onDismiss={dismiss} /></div>)}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context.toast;
}
