"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

type UploadPhase = "idle" | "preparing" | "uploading" | "starting" | "done" | "error";

interface UploadProgressProps {
  phase: UploadPhase;
  uploadProgress: number;
  error: string | null;
}

const STEPS: { id: UploadPhase[]; label: string; activeLabel: string }[] = [
  {
    id: ["preparing"],
    label: "Préparation",
    activeLabel: "Génération de l'URL sécurisée…",
  },
  {
    id: ["uploading"],
    label: "Envoi vers S3",
    activeLabel: "Upload en cours…",
  },
  {
    id: ["starting"],
    label: "Démarrage",
    activeLabel: "Création du job d'import…",
  },
  {
    id: ["done"],
    label: "Traitement",
    activeLabel: "Prêt",
  },
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
            ? "Erreur lors de l'upload"
            : phase === "done"
            ? "Fichier envoyé avec succès"
            : "Upload en cours…"}
        </p>
      </div>

      {/* Phase steps */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const status = getStepStatus(step.id, phase);
          return (
            <div key={i} className="flex flex-1 items-center gap-1">
              <div className="flex flex-col items-center gap-1 min-w-0">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border transition-all",
                    status === "done" &&
                      "border-success/40 bg-success/15 text-success",
                    status === "active" &&
                      "border-primary/40 bg-primary/15 text-primary",
                    status === "pending" &&
                      "border-border bg-muted text-muted-foreground",
                    status === "error" &&
                      "border-destructive/40 bg-destructive/15 text-destructive"
                  )}
                >
                  {status === "done" ? (
                    <CheckCircle2 size={12} />
                  ) : status === "active" ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Circle size={12} />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
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

      {/* Upload progress bar */}
      {phase === "uploading" && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Upload S3</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Error message */}
      {phase === "error" && error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
