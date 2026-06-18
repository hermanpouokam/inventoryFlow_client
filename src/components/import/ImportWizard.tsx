"use client";

import { useState, useCallback, useEffect } from "react";
import { ArrowRight, RotateCcw, CheckCircle2, MapPin, XCircle, ChevronDown } from "lucide-react";
import type { DataType, ImportJob, ConflictItem, SalesPoint } from "@/lib/types";
import { DataTypeSelector } from "./DataTypeSelector";
import { FileDropzone } from "./FileDropzone";
import { UploadProgress } from "./UploadProgress";
import { LiveProcessingPanel } from "./LiveProcessingPanel";
import { ConflictResolver } from "./ConflictResolver";
import { TemplateDownload } from "./TemplateDownload";
import { PreflightDialog } from "./Preflightdialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useImportUpload } from "@/hooks/useImportUpload";
import { useImportProgress } from "@/hooks/useImportProgress";
import { useAuth } from "@/hooks/useAuth";
import { resolveConflict, getSalesPoints } from "@/lib/api";
import { DATA_TYPE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { toast } from "../ui/app-toast";
import { useTranslation } from "react-i18next";
import { Combobox } from "../ComboBox";

type WizardStep = "select-type" | "upload" | "processing" | "done";

interface ImportWizardProps {
  onJobCreated?: (job: ImportJob) => void;
  resumeJobId?: string | null;
  onResumeConsumed?: () => void;
}

export function ImportWizard({ onJobCreated, resumeJobId, onResumeConsumed }: ImportWizardProps) {
  const { user } = useAuth();
  const isAdmin = user?.user_type === "admin";
  const { t } = useTranslation()

  const [step, setStep] = useState<WizardStep>("select-type");
  const [dataType, setDataType] = useState<DataType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [resolvedSet, setResolvedSet] = useState<Set<number>>(new Set());

  // ── Point de vente (admin) ────────────────────────────────────────
  const [salesPoints, setSalesPoints] = useState<SalesPoint[]>([]);
  const [selectedSalesPointId, setSelectedSalesPointId] = useState<number | null>(null);
  const [salesPointsLoading, setSalesPointsLoading] = useState(false);

  useEffect(() => {
    if (!resumeJobId) return;
    setActiveJobId(resumeJobId);   // injecte dans useImportProgress
    setStep("processing");          // saute directement à l'écran de suivi
    onResumeConsumed?.();
  }, [resumeJobId]);

  useEffect(() => {
    if (!isAdmin) return;
    setSalesPointsLoading(true);
    getSalesPoints()
      .then(setSalesPoints)
      .catch(() => toast({
        title: "erreur",
        variant: 'destructive',
        icon: <XCircle className="size-4" />,
        description: "Impossible de charger les points de vente"
      }))
      .finally(() => setSalesPointsLoading(false));
  }, [isAdmin]);

  // ── Upload hook ───────────────────────────────────────────────────
  const {
    phase, uploadProgress, error, columnErrors, upload, reset: resetUpload,
  } = useImportUpload();

  // ── WS progress hook ──────────────────────────────────────────────
  const {
    job, connected,
    preflightReport,
    sendResolveConflict,
    sendPreflightDecision,
  } = useImportProgress({
    jobId: activeJobId,
    onComplete: (finishedJob) => {
      setStep("done");
      toast({
        title: t("success"),
        variant: 'success',
        description: `Import terminé — ${finishedJob.success_rows.toLocaleString()} lignes importées`
      })
    },
    onError: (err) => {
      toast({
        title: "erreur",
        variant: 'destructive',
        icon: <XCircle className="size-4" />,
        description: `Erreur : ${err}`
      })
    },
  });

  // ── Démarrer l'import ─────────────────────────────────────────────
  const handleStart = useCallback(async () => {
    if (!file || !dataType) return;
    if (isAdmin && !selectedSalesPointId) {
      toast({
        title: "erreur",
        variant: 'warning',
        icon: <XCircle className="size-4" />,
        description: "Veuillez sélectionner un point de vente."
      })
      return;
    }
    setStep("upload");
    const createdJob = await upload(
      file, dataType, isAdmin ? selectedSalesPointId : undefined
    );
    if (createdJob) {
      setActiveJobId(createdJob.id);
      onJobCreated?.(createdJob);
      setStep("processing");
    } else {
      setStep("upload"); // reste sur l'étape upload pour afficher les erreurs
    }
  }, [file, dataType, isAdmin, selectedSalesPointId, upload, onJobCreated]);

  // ── Décision preflight ────────────────────────────────────────────
  const handlePreflightDecision = useCallback(
    async (decision: "auto_create" | "cancel") => {
      await sendPreflightDecision(decision);
      if (decision === "cancel") {
        // On reste sur "processing" → le WS va mettre status=failed
        toast({
          title: "Import annulé.",
          variant: 'default',
        })
      } else {
        toast({
          title: "Création des dépendances en cours…",
          variant: 'default',
        })
      }
    },
    [sendPreflightDecision]
  );

  // ── Résolution de conflits ────────────────────────────────────────
  const handleResolveConflict = useCallback(
    async (rowIndex: number, decision: "update" | "skip") => {
      if (!activeJobId) return;
      if (connected) {
        sendResolveConflict(rowIndex, decision);
      } else {
        await resolveConflict(activeJobId, rowIndex, decision);
      }
      setResolvedSet((prev) => new Set([...prev, rowIndex]));
      toast({
        title: decision === "update" ? "Entrée remplacée" : "Ligne ignorée",
        variant: 'default',
      })
    },
    [activeJobId, connected, sendResolveConflict]
  );

  // ── Reset ─────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    resetUpload();
    setStep("select-type");
    setDataType(null);
    setFile(null);
    setActiveJobId(null);
    setResolvedSet(new Set());
    setSelectedSalesPointId(null);
  }, [resetUpload]);

  const conflicts = Array.isArray(job?.pending_conflicts)
    ? (job!.pending_conflicts as ConflictItem[])
    : [];

  const canImport = !!file && (!isAdmin || !!selectedSalesPointId);

  // ═════════════════════════════════════════════════════════════════
  // Step : select-type
  // ═════════════════════════════════════════════════════════════════
  if (step === "select-type") {
    return (
      <div className="space-y-5">
        <div>
          <p className="mt-0.5 text-xs text-muted-foreground">Sélectionnez le type de données à importer</p>
        </div>

        <DataTypeSelector value={dataType} onChange={setDataType} />

        {dataType && (
          <div className="space-y-3 animate-slide-in">
            <TemplateDownload dataType={dataType} />

            {/* Admin — sélection du point de vente */}
            {isAdmin && (
              <Combobox
                options={salesPoints}
                value={
                  salesPoints.find((sp) => sp.id === selectedSalesPointId) ?? null
                }
                getOptionLabel={(sp) => sp.name}
                getOptionValue={(sp) => sp.id.toString()}
                placeholder="Rechercher un point de vente..."
                buttonLabel="Choisir un point de vente..."
                RightIcon={ChevronDown}
                onValueChange={(sp) => setSelectedSalesPointId(sp?.id ?? null)}
              />
            )}

            {/* Manager — info point de vente automatique */}
            {!isAdmin && user?.sales_point && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <MapPin size={12} className="shrink-0 text-primary" />
                Import dans : <span className="font-medium text-foreground">{user.sales_point.name}</span>
              </div>
            )}

            <div>
              <h2 className="mb-2 text-sm font-semibold text-foreground">Fichier</h2>
              <FileDropzone file={file} onFile={setFile} onClear={() => setFile(null)} />
            </div>

            <Button onClick={handleStart} disabled={!canImport} className="w-full" size="lg">
              Importer {DATA_TYPE_LABELS[dataType]}
              <ArrowRight size={15} />
            </Button>

            {isAdmin && !selectedSalesPointId && file && (
              <p className="text-center text-xs text-muted-foreground">
                Sélectionnez un point de vente pour continuer.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // Step : upload
  // ═════════════════════════════════════════════════════════════════
  if (step === "upload") {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Envoi du fichier</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{file?.name}</p>
        </div>

        <UploadProgress phase={phase} uploadProgress={uploadProgress} error={error} />

        {columnErrors && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle size={14} />
                <span className="text-sm font-semibold">Colonnes incompatibles</span>
              </div>
              <ul className="space-y-1">
                {columnErrors.errors.map((e, i) => (
                  <li key={i} className="text-xs text-destructive/90 flex gap-1.5">
                    <span>•</span><span>{e}</span>
                  </li>
                ))}
              </ul>
              {columnErrors.expected_columns.length > 0 && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer font-medium text-foreground mb-2">
                    Colonnes attendues
                  </summary>
                  <div className="grid grid-cols-2 gap-1">
                    {columnErrors.expected_columns.map((col) => (
                      <div
                        key={col.name}
                        className={cn(
                          "rounded px-2 py-1 font-mono",
                          col.required
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {col.name}{col.required && <span className="ml-1 text-[10px]">*</span>}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        )}

        {phase === "error" && (
          <Button variant="outline" onClick={handleReset} className="w-full">
            <RotateCcw size={14} /> Réessayer
          </Button>
        )}
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // Step : processing (inclut l'état "paused" pour le preflight)
  // ═════════════════════════════════════════════════════════════════
  if (step === "processing") {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {job?.status === "paused" ? "Action requise" : "Traitement en cours"}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {job?.status === "paused"
              ? "L'import est en pause — consultez le rapport ci-dessous."
              : "Suivi en temps réel"}
            {job?.sales_point_name && (
              <> · <MapPin size={10} className="inline" /> {job.sales_point_name}</>
            )}
          </p>
        </div>

        {/* Panneau de progression (toujours visible pour le contexte) */}
        {job && (
          <Card>
            <CardContent className="pt-5">
              <LiveProcessingPanel job={job} connected={connected} />
            </CardContent>
          </Card>
        )}

        {/* Dialogue preflight — affiché uniquement si job en pause */}
        {job?.status === "paused" && preflightReport && (
          <PreflightDialog
            report={preflightReport}
            onDecision={handlePreflightDecision}
          />
        )}

        {/* Résolution de conflits (après traitement) */}
        {conflicts.length > 0 && job?.status !== "paused" && (
          <ConflictResolver
            conflicts={conflicts}
            onResolve={handleResolveConflict}
            resolvedSet={resolvedSet}
          />
        )}
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // Step : done
  // ═════════════════════════════════════════════════════════════════
  if (step === "done" && job) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Import terminé !</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {job.success_rows.toLocaleString()} entrées importées avec succès
              {job.error_rows > 0 && ` · ${job.error_rows} erreur${job.error_rows > 1 ? "s" : ""}`}
              {job.sales_point_name && (
                <> · <MapPin size={10} className="inline" /> {job.sales_point_name}</>
              )}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-5">
            <LiveProcessingPanel job={job} connected={false} />
          </CardContent>
        </Card>

        <Button variant="outline" onClick={handleReset} className="w-full">
          <RotateCcw size={14} /> Nouvel import
        </Button>
      </div>
    );
  }

  return null;
}