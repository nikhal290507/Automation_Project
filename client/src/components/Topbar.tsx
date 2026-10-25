import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, LogOut, Menu, User as UserIcon, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { initials } from "../lib/utils";
import { Sidebar } from "./Sidebar";

export function Topbar({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeFromOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeFromOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-canvas/80 px-4 backdrop-blur-xl lg:px-8">
        <div className="flex items-center gap-3">
          <button className="lg:hidden text-ink-muted" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation">
            <Menu size={22} />
          </button>
          <h1 className="font-display text-lg font-semibold text-ink">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted hover:bg-surface-raised hover:text-ink" aria-label="Notifications">
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent-blue" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Open profile menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-gradient text-xs font-semibold text-white"
            >
              {user ? initials(user.name) : <UserIcon size={16} />}
            </button>
            {menuOpen && (
              <div role="menu" aria-label="Profile menu" className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-surface-raised p-1.5 shadow-card">
                <div className="px-3 py-2 text-sm">
                  <p className="font-medium text-ink truncate">{user?.name}</p>
                  <p className="text-xs text-ink-muted truncate">{user?.email}</p>
                </div>
                <div className="my-1 h-px bg-border" />
                <Link to="/settings" role="menuitem" className="block rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-surface hover:text-ink" onClick={() => setMenuOpen(false)}>
                  Settings
                </Link>
                <button
                  onClick={logout}
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-state-danger hover:bg-surface"
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-surface">
            <button className="absolute right-3 top-4 text-ink-muted" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation">
              <X size={20} />
            </button>
            <div onClick={() => setMobileNavOpen(false)}>
              <Sidebar mobile />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
