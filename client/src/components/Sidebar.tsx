import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Workflow,
  LayoutTemplate,
  Sparkles,
  Focus,
  Activity,
  BarChart3,
  Settings,
  CreditCard,
  Plug,
} from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "../lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/automations", label: "Automations", icon: Workflow },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/focus", label: "Focus Mode", icon: Focus },
  { to: "/apps", label: "Connected Apps", icon: Plug },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const bottomItems = [
  { to: "/billing", label: "Billing", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-surface/60 backdrop-blur-xl",
        mobile ? "h-full w-64" : "hidden lg:flex fixed inset-y-0 left-0 w-64"
      )}
    >
      <div className="px-5 py-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-accent-gradient-soft text-accent-blue" : "text-ink-muted hover:bg-surface-raised hover:text-ink"
              )
            }
          >
            <item.icon className="h-4.5 w-4.5" size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-0.5 border-t border-border px-3 py-3">
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-accent-gradient-soft text-accent-blue" : "text-ink-muted hover:bg-surface-raised hover:text-ink"
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
