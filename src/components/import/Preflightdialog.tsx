"use client";

/**
 * PreflightDialog
 * Affiché quand le job est en statut "paused" après l'analyse des dépendances.
 * Montre ce qui sera créé automatiquement, ce qui bloque, et les erreurs de format.
 * Deux actions : "Créer et continuer" ou "Annuler l'import".
 */

import { useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    XCircle,
    PlusCircle,
    ChevronDown,
    ChevronUp,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────

interface AutoCreatable {
    type: string;
    name: string;
    extra: Record<string, string | null>;
    needed_by_rows: number[];
}

interface Blocking {
    type: string;
    name: string;
    reason: string;
    needed_by_rows: number[];
}

interface RowError {
    row: number;
    field: string;
    message: string;
}

export interface PreflightReport {
    has_issues: boolean;
    auto_creatable?: AutoCreatable[];
    blocking?: Blocking[];
    row_errors?: RowError[];
}

interface PreflightDialogProps {
    report: PreflightReport;
    onDecision: (decision: "auto_create" | "cancel") => Promise<void>;
}

// ── Labels lisibles ────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
    category: "Catégorie",
    client_category: "Catégorie client",
    supplier: "Fournisseur",
    packaging: "Emballage",
    product: "Produit",
};

function typeLabel(t: string) {
    return TYPE_LABELS[t] ?? t;
}

// ── Sous-composant : section pliable ───────────────────────────────

function Section({
    title,
    count,
    variant,
    children,
}: {
    title: string;
    count: number;
    variant: "success" | "warning" | "error";
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(true);

    const colors = {
        success: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30",
        warning: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30",
        error: "border-destructive/20 bg-destructive/5",
    };
    const badgeColors = {
        success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
        warning: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
        error: "bg-destructive/10 text-destructive",
    };
    const Icon = {
        success: PlusCircle,
        warning: AlertTriangle,
        error: XCircle,
    }[variant];

    return (
        <div className={cn("rounded-lg border", colors[variant])}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
                <span className="flex items-center gap-2 text-sm font-semibold">
                    <Icon size={14} />
                    {title}
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", badgeColors[variant])}>
                        {count}
                    </span>
                </span>
                {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {open && <div className="border-t border-inherit px-4 pb-4 pt-3">{children}</div>}
        </div>
    );
}

// ── Composant principal ────────────────────────────────────────────

export function PreflightDialog({ report, onDecision }: PreflightDialogProps) {
    const [loading, setLoading] = useState<"auto_create" | "cancel" | null>(null);

    const hasBlocking = (report.blocking ?? []).length > 0;
    const hasRowErrors = (report.row_errors ?? []).length > 0;
    const hasAutoCreate = (report.auto_creatable ?? []).length > 0;

    // Si bloquants ou erreurs de format → on ne peut proposer que "Annuler"
    const canAutoCreate = !hasBlocking && !hasRowErrors && hasAutoCreate;

    async function handleDecision(decision: "auto_create" | "cancel") {
        setLoading(decision);
        try {
            await onDecision(decision);
        } finally {
            setLoading(null);
        }
    }

    return (
        <Card className="border-amber-300 dark:border-amber-700">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-amber-700 dark:text-amber-400">
                    <AlertTriangle size={16} />
                    Analyse des dépendances — action requise
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                    Le fichier référence des données qui n&apos;existent pas encore.
                    Consultez le rapport ci-dessous et choisissez comment procéder.
                </p>
            </CardHeader>

            <CardContent className="space-y-3">

                {/* ── Dépendances créables automatiquement ── */}
                {hasAutoCreate && (
                    <Section
                        title="Seront créés automatiquement"
                        count={report.auto_creatable?.length ?? 0}
                        variant="success"
                    >
                        <ul className="space-y-2">
                            {(report.auto_creatable ?? [])?.map((dep, i) => (
                                <li key={i} className="space-y-0.5">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Badge variant="outline" className="text-[10px] font-normal">
                                            {typeLabel(dep.type)}
                                        </Badge>
                                        <span className="font-medium">{dep.name}</span>
                                    </div>
                                    {/* Infos supplémentaires récupérées du CSV */}
                                    {Object.entries(dep.extra).filter(([, v]) => v).length > 0 && (
                                        <div className="ml-1 flex flex-wrap gap-2">
                                            {Object.entries(dep.extra)
                                                .filter(([, v]) => v)
                                                .map(([k, v]) => (
                                                    <span key={k} className="text-[11px] text-muted-foreground">
                                                        {k}: <span className="text-foreground">{v}</span>
                                                    </span>
                                                ))}
                                        </div>
                                    )}
                                    <p className="text-[11px] text-muted-foreground">
                                        Utilisé en ligne{dep.needed_by_rows.length > 1 ? "s" : ""}{" "}
                                        {dep.needed_by_rows.slice(0, 5).join(", ")}
                                        {dep.needed_by_rows.length > 5 && ` +${dep.needed_by_rows.length - 5}`}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}

                {/* ── Éléments bloquants ── */}
                {hasBlocking && (
                    <Section
                        title="Éléments bloquants — ne peuvent pas être créés"
                        count={report.blocking?.length ?? 0}
                        variant="error"
                    >
                        <ul className="space-y-2">
                            {(report.blocking ?? []).map((b, i) => (
                                <li key={i} className="space-y-0.5">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Badge variant="outline" className="text-[10px] font-normal">
                                            {typeLabel(b.type)}
                                        </Badge>
                                        <span className="font-medium">{b.name}</span>
                                    </div>
                                    <p className="text-xs text-destructive/80">{b.reason}</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Ligne{b.needed_by_rows.length > 1 ? "s" : ""}{" "}
                                        {b.needed_by_rows.slice(0, 5).join(", ")}
                                        {b.needed_by_rows.length > 5 && ` +${b.needed_by_rows.length - 5}`}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}

                {/* ── Erreurs de format / valeurs invalides ── */}
                {hasRowErrors && (
                    <Section
                        title="Valeurs invalides dans le fichier"
                        count={report.row_errors?.length ?? 0}
                        variant="warning"
                    >
                        <ul className="space-y-1.5">
                            {(report.row_errors ?? [])?.map((e, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs">
                                    <span className="mt-0.5 shrink-0 rounded bg-amber-100 px-1.5 py-0.5 font-mono text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                                        L.{e.row}
                                    </span>
                                    <span>
                                        <span className="font-medium text-foreground">{e.field}</span>
                                        {" — "}
                                        <span className="text-muted-foreground">{e.message}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}

                {/* ── Actions ── */}
                <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                    {canAutoCreate && (
                        <Button
                            onClick={() => handleDecision("auto_create")}
                            disabled={loading !== null}
                            className="flex-1"
                        >
                            {loading === "auto_create" ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <CheckCircle2 size={14} />
                            )}
                            Créer et continuer
                        </Button>
                    )}

                    <Button
                        variant={canAutoCreate ? "outline" : "destructive"}
                        onClick={() => handleDecision("cancel")}
                        disabled={loading !== null}
                        className={canAutoCreate ? "flex-1" : "w-full"}
                    >
                        {loading === "cancel" ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <XCircle size={14} />
                        )}
                        {canAutoCreate ? "Annuler l'import" : "Fermer et corriger le fichier"}
                    </Button>
                </div>

                {/* Message si bloquant ou erreur de format */}
                {(hasBlocking || hasRowErrors) && (
                    <p className="text-center text-xs text-muted-foreground">
                        Corrigez les problèmes ci-dessus dans votre fichier et relancez l&apos;import.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}