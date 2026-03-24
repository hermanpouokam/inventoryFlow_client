import { Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SettingCategory, } from "@/lib/user-config";
import Link from "next/link";

interface SettingsSidebarProps {
    activeCategory: string;
    onCategoryChange: (id: string) => void;
    searchQuery: string;
    onSearchChange: (q: string) => void;
    modifiedByCategory: Record<string, number>;
    settingsConfig: SettingCategory[]
}

export function SettingsSidebar({
    activeCategory,
    onCategoryChange,
    searchQuery,
    onSearchChange,
    modifiedByCategory,
    settingsConfig
}: SettingsSidebarProps) {
    return (
        <aside className="flex h-full flex-col border-r border-border bg-card/50">
            {/* header */}
            <div className="border-b border-border px-4 py-5">
                {/* <Link
                    href="/"
                    className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Retour au site
                </Link> */}
                <h1 className="text-lg font-bold text-foreground">Paramètres</h1>
                <p className="mt-1 text-xs text-muted-foreground">Gérez la configuration de votre magasin</p>
            </div>

            {/* search */}
            <div className="px-4 pt-4 pb-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Rechercher..."
                        className="bg-background pl-9 text-sm"
                    />
                </div>
            </div>

            {/* categories */}
            <nav className="flex-1 overflow-y-auto px-3 py-2">
                <ul className="space-y-1">
                    {settingsConfig.map((cat) => {
                        const isActive = activeCategory === cat.id;
                        const modCount = modifiedByCategory[cat.id] || 0;
                        return (
                            <li key={cat.id}>
                                <button
                                    onClick={() => onCategoryChange(cat.id)}
                                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                                        ? "gradient-primary text-primary-foreground shadow-glow"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        }`}
                                >
                                    <cat.icon className="h-4 w-4 shrink-0" />
                                    <span className="flex-1 truncate text-left">{cat.label}</span>
                                    {modCount > 0 && (
                                        <span
                                            className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${isActive
                                                ? "bg-primary-foreground/20 text-primary-foreground"
                                                : "bg-primary/10 text-primary"
                                                }`}
                                        >
                                            {modCount}
                                        </span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* footer hint */}
            <div className="border-t border-border px-4 py-4">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Les modifications ne sont appliquées qu'après sauvegarde.
                </p>
            </div>
        </aside>
    );
}
