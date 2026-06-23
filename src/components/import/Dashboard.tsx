"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  GitMerge,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getImportHistory } from "@/lib/api";
import type { ImportJob } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function Dashboard() {
  const { t } = useTranslation("common");
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getImportHistory()
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const completed = jobs.filter((job) => job.status === "completed");
  const failed = jobs.filter((job) => job.status === "failed");
  const totalRows = jobs.reduce((sum, job) => sum + job.success_rows, 0);
  const totalConflicts = jobs.reduce((sum, job) => {
    const conflicts = typeof job.pending_conflicts === "number"
      ? job.pending_conflicts
      : job.pending_conflicts.length;
    return sum + conflicts;
  }, 0);

  const stats = [
    {
      label: t("import.dashboard.successful_imports"),
      value: completed.length,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: t("import.dashboard.imported_rows"),
      value: totalRows.toLocaleString(),
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: t("import.dashboard.failures"),
      value: failed.length,
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: t("import.dashboard.total_conflicts"),
      value: totalConflicts,
      icon: GitMerge,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-shimmer shimmer-bg rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4">
              <div className={cn("mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg", stat.bg)}>
                <stat.icon size={16} className={stat.color} />
              </div>
              <p className={cn("text-2xl font-bold tabular-nums", stat.color)}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
