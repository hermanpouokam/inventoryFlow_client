"use client";

import {
  Upload,
  History,
  LayoutDashboard,
  Settings,
  Package2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "import" | "history" | "dashboard";

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const NAV_ITEMS: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: "import", icon: Upload, label: "Importer" },
  { id: "history", icon: History, label: "Historique" },
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Package2 size={15} />
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground">
          InventoryFlow
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-2 pt-3">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Données
        </p>
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              activeTab === id
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-2">
        <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Settings size={15} />
          Paramètres
        </button>
      </div>
    </aside>
  );
}
