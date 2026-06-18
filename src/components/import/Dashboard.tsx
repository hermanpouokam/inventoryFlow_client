"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  GitMerge,
  FileSpreadsheet,
} from "lucide-react";
import { getImportHistory } from "@/lib/api";
import type { ImportJob } from "@/lib/types";
import { DATA_TYPE_LABELS } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG } from "@/lib/utils";

export function Dashboard() {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    getImportHistory()
      .then(setJobs)
      .catch((e) => { setError(e) })
      .finally(() => setLoading(false));
  }, []);

  const completed = jobs.filter((j) => j.status === "completed");
  const failed = jobs.filter((j) => j.status === "failed");
  const totalRows = jobs.reduce((s, j) => s + j.success_rows, 0);
  const totalConflicts = jobs.reduce((s, j) => {
    const c = typeof j.pending_conflicts === "number" ? j.pending_conflicts : (j.pending_conflicts as unknown[]).length;
    return s + c;
  }, 0);

  const stats = [
    {
      label: "Imports réussis",
      value: completed.length,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Lignes importées",
      value: totalRows.toLocaleString(),
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Échecs",
      value: failed.length,
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "Conflits totaux",
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
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <div className={cn("mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg", s.bg)}>
                <s.icon size={16} className={s.color} />
              </div>
              <p className={cn("text-2xl font-bold tabular-nums", s.color)}>
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}