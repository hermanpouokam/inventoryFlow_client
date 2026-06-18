"use client";

import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  FileSpreadsheet,
} from "lucide-react";
import { cn, STATUS_CONFIG, formatDate } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { ImportJob, TimelineStep } from "@/lib/types";
import { DATA_TYPE_LABELS } from "@/lib/types";

interface LiveProcessingPanelProps {
  job: ImportJob;
  connected: boolean;
}

function TimelineStepRow({ step }: { step: TimelineStep }) {
  const status = step.status;
  return (
    <div className="flex items-start gap-3">
      <div className="relative flex flex-col items-center">
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all",
            status === "done" &&
              "border-success/40 bg-success/10 text-success",
            status === "active" &&
              "border-primary/50 bg-primary/10 text-primary",
            status === "pending" &&
              "border-border bg-muted text-muted-foreground",
            status === "failed" &&
              "border-destructive/40 bg-destructive/10 text-destructive"
          )}
        >
          {status === "done" && <CheckCircle2 size={13} />}
          {status === "active" && (
            <Loader2 size={13} className="animate-spin" />
          )}
          {status === "pending" && <Circle size={13} />}
          {status === "failed" && <XCircle size={13} />}
        </div>
      </div>
      <div className="min-w-0 flex-1 pb-5">
        <p
          className={cn(
            "text-sm font-medium",
            status === "done" && "text-success",
            status === "active" && "text-foreground",
            status === "pending" && "text-muted-foreground",
            status === "failed" && "text-destructive"
          )}
        >
          {step.label}
        </p>
        {step.at && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDate(step.at)}
          </p>
        )}
      </div>
    </div>
  );
}

export function LiveProcessingPanel({
  job,
  connected,
}: LiveProcessingPanelProps) {
  const cfg = STATUS_CONFIG[job.status];
  const pct = job.total_rows > 0
    ? Math.round((job.processed_rows / job.total_rows) * 100)
    : job.progress ?? 0;

  const hasConflicts =
    typeof job.pending_conflicts === "number"
      ? job.pending_conflicts > 0
      : Array.isArray(job.pending_conflicts) && job.pending_conflicts.length > 0;

  const conflictCount =
    typeof job.pending_conflicts === "number"
      ? job.pending_conflicts
      : Array.isArray(job.pending_conflicts)
      ? job.pending_conflicts.length
      : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {job.original_filename}
            </p>
            <p className="text-xs text-muted-foreground">
              {DATA_TYPE_LABELS[job.data_type]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* WebSocket indicator */}
          <span title={connected ? "Temps réel connecté" : "Déconnecté"}>
            {connected ? (
              <Wifi size={13} className="text-success" />
            ) : (
              <WifiOff size={13} className="text-muted-foreground animate-pulse" />
            )}
          </span>
          <Badge
            variant={
              job.status === "completed"
                ? "success"
                : job.status === "failed"
                ? "destructive"
                : job.status === "processing"
                ? "default"
                : "outline"
            }
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
            {cfg.label}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {job.processed_rows.toLocaleString()} /{" "}
            {job.total_rows.toLocaleString()} lignes
          </span>
          <span className="font-mono font-medium text-foreground">{pct}%</span>
        </div>
        <Progress
          value={pct}
          animated={job.status === "processing"}
          barClassName={
            job.status === "failed"
              ? "bg-destructive"
              : job.status === "completed"
              ? "bg-success"
              : undefined
          }
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        <StatCell
          label="Succès"
          value={job.success_rows}
          color="text-success"
          bg="bg-success/10"
        />
        <StatCell
          label="Erreurs"
          value={job.error_rows}
          color="text-destructive"
          bg="bg-destructive/10"
        />
        <StatCell
          label="Conflits"
          value={conflictCount}
          color="text-warning"
          bg="bg-warning/10"
        />
      </div>

      {/* Conflicts warning */}
      {hasConflicts && job.status !== "completed" && (
        <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 p-3">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" />
          <div>
            <p className="text-xs font-semibold text-warning">
              {conflictCount} conflit{conflictCount > 1 ? "s" : ""} en attente
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Des entrées existent déjà avec le même nom. Résolvez chaque
              conflit ci-dessous.
            </p>
          </div>
        </div>
      )}

      {/* Timeline */}
      {job.timeline && job.timeline.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Étapes
          </p>
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-3.5 top-0 h-full w-px bg-border" />
            <div className="space-y-0">
              {job.timeline.map((step) => (
                <TimelineStepRow key={step.id} step={step} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Errors list */}
      {job.errors && job.errors.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Erreurs ({job.errors.length})
          </p>
          <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            {job.errors.map((err, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="shrink-0 font-mono text-muted-foreground">
                  {err.row != null ? `L${err.row}` : "—"}
                </span>
                <span className="text-destructive">{err.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCell({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className={cn("rounded-lg p-3", bg)}>
      <p className={cn("text-lg font-bold tabular-nums", color)}>
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
