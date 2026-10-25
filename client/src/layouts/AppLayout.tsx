import { ReactNode } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

export function AppLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar title={title} />
        <main className="px-4 py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
