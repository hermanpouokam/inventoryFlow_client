"use client";

import {
  Upload,
  History,
  LayoutDashboard,
  Settings,
  Package2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type Tab = "import" | "history" | "dashboard";

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const NAV_ITEMS: { id: Tab; icon: React.ElementType; labelKey: string }[] = [
  { id: "import", icon: Upload, labelKey: "navigation.items.import" },
  { id: "history", icon: History, labelKey: "navigation.items.history" },
  { id: "dashboard", icon: LayoutDashboard, labelKey: "navigation.groups.dashboard" },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { t } = useTranslation("common");

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Package2 size={15} />
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground">
          InventoryFlow
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 p-2 pt-3">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t("navigation.groups.data")}
        </p>
        {NAV_ITEMS.map(({ id, icon: Icon, labelKey }) => (
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
            {t(labelKey)}
          </button>
        ))}
      </nav>

      <div className="border-t border-border p-2">
        <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Settings size={15} />
          {t("settings.title")}
        </button>
      </div>
    </aside>
  );
}
