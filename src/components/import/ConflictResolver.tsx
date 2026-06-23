"use client";

import { useState } from "react";
import { GitMerge, SkipForward, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ConflictItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ConflictResolverProps {
  conflicts: ConflictItem[];
  onResolve: (rowIndex: number, decision: "update" | "skip") => void;
  resolvedSet: Set<number>;
}

export function ConflictResolver({
  conflicts,
  onResolve,
  resolvedSet,
}: ConflictResolverProps) {
  const { t } = useTranslation("common");
  const [expanded, setExpanded] = useState<number | null>(
    conflicts[0]?.row_index ?? null
  );

  if (!conflicts.length) return null;

  const pending = conflicts.filter((c) => !resolvedSet.has(c.row_index));
  const resolved = conflicts.filter((c) => resolvedSet.has(c.row_index));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("import.conflicts.title")}
        </p>
        <Badge variant="warning">
          {t("import.conflicts.pending", { count: pending.length })}
        </Badge>
      </div>

      <div className="space-y-2">
        {conflicts.map((conflict) => {
          const isResolved = resolvedSet.has(conflict.row_index);
          const isOpen = expanded === conflict.row_index;

          return (
            <div
              key={conflict.row_index}
              className={cn(
                "overflow-hidden rounded-lg border transition-colors",
                isResolved
                  ? "border-border bg-muted/30 opacity-60"
                  : "border-warning/30 bg-warning/5"
              )}
            >
              <button
                className="flex w-full items-center justify-between p-3 text-left"
                onClick={() => setExpanded(isOpen ? null : conflict.row_index)}
              >
                <div className="flex items-center gap-2">
                  <GitMerge
                    size={13}
                    className={isResolved ? "text-muted-foreground" : "text-warning"}
                  />
                  <span className="text-sm font-medium">
                    {t("import.conflicts.row", { row: conflict.row_index, name: conflict.existing_name })}
                  </span>
                  {isResolved && <Badge variant="outline">{t("import.conflicts.resolved")}</Badge>}
                </div>
                {isOpen ? (
                  <ChevronUp size={13} className="text-muted-foreground" />
                ) : (
                  <ChevronDown size={13} className="text-muted-foreground" />
                )}
              </button>

              {isOpen && (
                <div className="border-t border-border px-3 pb-3 pt-3 space-y-3">
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/60">
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                            {t("import.conflicts.field")}
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                            {t("import.conflicts.new_value")}
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                            {t("import.conflicts.existing", { id: conflict.existing_id })}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(conflict.row_data).map(([k, v]) => (
                          <tr key={k} className="border-b border-border/50 last:border-0">
                            <td className="px-3 py-2 font-mono text-muted-foreground">
                              {k}
                            </td>
                            <td className="px-3 py-2 text-foreground">{v}</td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {k === "name" ? conflict.existing_name : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {!isResolved && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onResolve(conflict.row_index, "update")}
                        className="flex-1"
                      >
                        <GitMerge size={13} />
                        {t("import.conflicts.replace_existing")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResolve(conflict.row_index, "skip")}
                        className="flex-1"
                      >
                        <SkipForward size={13} />
                        {t("import.conflicts.skip_row")}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {resolved.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {t(resolved.length > 1 ? "import.conflicts.resolved_count_plural" : "import.conflicts.resolved_count", { count: resolved.length })}
        </p>
      )}
    </div>
  );
}
