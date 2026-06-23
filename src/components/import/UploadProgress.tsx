"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import Spinner from "../Spinner";

type UploadPhase = "idle" | "preparing" | "uploading" | "starting" | "done" | "error";

interface UploadProgressProps {
  phase: UploadPhase;
  uploadProgress: number;
  error: string | null;
}

const STEP_CONFIG: { id: UploadPhase[]; labelKey: string }[] = [
  { id: ["preparing"], labelKey: "import.upload.steps.preparing.label" },
  { id: ["uploading"], labelKey: "import.upload.steps.uploading.label" },
  { id: ["starting"], labelKey: "import.upload.steps.starting.label" },
  { id: ["done"], labelKey: "import.upload.steps.done.label" },
];

function getStepStatus(
  stepIds: UploadPhase[],
  currentPhase: UploadPhase
): "done" | "active" | "pending" | "error" {
  if (currentPhase === "error") return "error";
  const order: UploadPhase[] = ["idle", "preparing", "uploading", "starting", "done"];
  const stepOrder = Math.max(...stepIds.map((id) => order.indexOf(id)));
  const currentOrder = order.indexOf(currentPhase);
  if (currentOrder > stepOrder) return "done";
  if (stepIds.includes(currentPhase)) return "active";
  return "pending";
}

export function UploadProgress({
  phase,
  uploadProgress,
  error,
}: UploadProgressProps) {
  const { t } = useTranslation("common");

  if (phase === "idle") return null;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        {phase === "error" ? (
          <XCircle size={18} className="text-destructive" />
        ) : phase === "done" ? (
          <CheckCircle2 size={18} className="text-success" />
        ) : (
          <Loader2 size={18} className="animate-spin text-primary" />
        )}
        <p className="text-sm font-medium">
          {phase === "error"
            ? t("import.upload.error")
            : phase === "done"
              ? t("import.upload.done")
              : t("import.upload.in_progress")}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {STEP_CONFIG.map((step, i) => {
          const status = getStepStatus(step.id, phase);
          return (
            <div key={step.labelKey} className="flex flex-1 items-center gap-1">
              <div className="flex flex-col items-center gap-1 min-w-0">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border transition-all",
                    status === "done" && "border-success/40 bg-success/15 text-success",
                    status === "active" && "border-primary/40 bg-primary/15 text-primary",
                    status === "pending" && "border-border bg-muted text-muted-foreground",
                    status === "error" && "border-destructive/40 bg-destructive/15 text-destructive"
                  )}
                >
                  {status === "done" ? (
                    <CheckCircle2 size={12} />
                  ) : status === "active" ? (
                    <Spinner />
                  ) : (
                    <Circle size={12} />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {t(step.labelKey)}
                </span>
              </div>
              {i < STEP_CONFIG.length - 1 && (
                <div
                  className={cn(
                    "mb-3 h-px flex-1 transition-colors",
                    status === "done" ? "bg-success/30" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {phase === "uploading" && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("import.upload.s3")}</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {phase === "error" && error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
