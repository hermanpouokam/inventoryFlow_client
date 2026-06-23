"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  ExternalLink,
  FileSpreadsheet,
  Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getImportHistory } from "@/lib/api";
import type { ImportJob, DataType } from "@/lib/types";
import { DATA_TYPE_LABEL_KEYS } from "@/lib/types";
import { cn, STATUS_CONFIG, formatRelativeTime, formatFileSize } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface HistoryTableProps {
  onSelectJob: (job: ImportJob) => void;
  refreshTick?: number;
}

const DATA_TYPES = Object.keys(DATA_TYPE_LABEL_KEYS) as DataType[];

export function HistoryTable({ onSelectJob, refreshTick }: HistoryTableProps) {
  const { t } = useTranslation("common");
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DataType | "all">("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getImportHistory(
        filter !== "all" ? filter : undefined
      );
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load, refreshTick]);

  return (
    <div className="space-y-4 mt-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
            filter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          {t("import.history.all")}
        </button>
        {DATA_TYPES.map((dataType) => (
          <button
            key={dataType}
            onClick={() => setFilter(dataType)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filter === dataType
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {t(DATA_TYPE_LABEL_KEYS[dataType])}
          </button>
        ))}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto shrink-0"
          onClick={load}
          disabled={loading}
        >
          <RefreshCw size={14} />
        </Button>
      </div>

      {loading && jobs.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-shimmer shimmer-bg rounded-lg" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <Clock size={28} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{t("import.history.empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => {
            const cfg = STATUS_CONFIG[job.status];
            const pct =
              job.total_rows > 0
                ? Math.round((job.processed_rows / job.total_rows) * 100)
                : job.progress ?? 0;

            return (
              <button
                key={job.id}
                onClick={() => onSelectJob(job)}
                className="group flex w-full flex-col gap-2 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-border/80 hover:bg-muted/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileSpreadsheet size={14} className="shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm font-medium text-foreground">
                      {job.original_filename}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      variant={
                        job.status === "completed"
                          ? "secondary"
                          : job.status === "failed"
                            ? "destructive"
                            : job.status === "processing"
                              ? "default"
                              : "outline"
                      }
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                      {t(cfg.labelKey)}
                    </Badge>
                    <ExternalLink
                      size={13}
                      className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{t(DATA_TYPE_LABEL_KEYS[job.data_type])}</span>
                  <span>-</span>
                  <span>{job.total_rows.toLocaleString()} {t("import.history.lines")}</span>
                  <span>-</span>
                  <span>{formatFileSize(job.file_size)}</span>
                  <span className="ml-auto">{formatRelativeTime(job.created_at, t)}</span>
                </div>

                {(job.status === "processing" || job.status === "completed") && (
                  <Progress
                    value={pct}
                    className={cn("h-1", job.status === "completed" ? "bg-success" : undefined)}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
