import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-canvas-glow pointer-events-none" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="flex justify-center mb-8">
          <Logo />
        </Link>
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-card">
          <h1 className="font-display text-xl font-semibold text-ink text-center">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-muted text-center">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
