"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  MapPin,
  XCircle,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DataType, ImportJob, ConflictItem, SalesPoint } from "@/lib/types";
import { DATA_TYPE_LABEL_KEYS } from "@/lib/types";
import { DataTypeSelector } from "./DataTypeSelector";
import { FileDropzone } from "./FileDropzone";
import { UploadProgress } from "./UploadProgress";
import { LiveProcessingPanel } from "./LiveProcessingPanel";
import { ConflictResolver } from "./ConflictResolver";
import { TemplateDownload } from "./TemplateDownload";
import { PreflightDialog } from "./Preflightdialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useImportUpload } from "@/hooks/useImportUpload";
import { useImportProgress } from "@/hooks/useImportProgress";
import { useAuth } from "@/hooks/useAuth";
import { resolveConflict, getSalesPoints } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "../ui/app-toast";
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
  const { t } = useTranslation("common");

  const [step, setStep] = useState<WizardStep>("select-type");
  const [dataType, setDataType] = useState<DataType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [resolvedSet, setResolvedSet] = useState<Set<number>>(new Set());
  const [salesPoints, setSalesPoints] = useState<SalesPoint[]>([]);
  const [selectedSalesPointId, setSelectedSalesPointId] = useState<number | null>(null);
  const [, setSalesPointsLoading] = useState(false);

  useEffect(() => {
    if (!resumeJobId) return;
    setActiveJobId(resumeJobId);
    setStep("processing");
    onResumeConsumed?.();
  }, [resumeJobId, onResumeConsumed]);

  useEffect(() => {
    if (!isAdmin) return;
    setSalesPointsLoading(true);
    getSalesPoints()
      .then(setSalesPoints)
      .catch(() => toast({
        title: t("import.toast.error_title"),
        variant: "destructive",
        icon: <XCircle className="size-4" />,
        description: t("import.sales_point.load_error"),
      }))
      .finally(() => setSalesPointsLoading(false));
  }, [isAdmin, t]);

  const {
    phase,
    uploadProgress,
    error,
    columnErrors,
    upload,
    reset: resetUpload,
  } = useImportUpload();

  const {
    job,
    connected,
    preflightReport,
    sendResolveConflict,
    sendPreflightDecision,
  } = useImportProgress({
    jobId: activeJobId,
    onComplete: (finishedJob) => {
      setStep("done");
      toast({
        title: t("success"),
        variant: "success",
        icon: <CheckCircle2 className="size-4" />,
        description: t("import.toast.import_done", {
          success: finishedJob.success_rows.toLocaleString(),
        }),
      });
    },
    onError: (err) => {
      toast({
        title: t("import.toast.error_title"),
        variant: "destructive",
        icon: <XCircle className="size-4" />,
        description: t("import.toast.import_error", { error: err }),
      });
    },
  });

  const handleStart = useCallback(async () => {
    if (!file || !dataType) return;
    if (isAdmin && !selectedSalesPointId) {
      toast({
        title: t("import.toast.error_title"),
        variant: "warning",
        icon: <AlertTriangle className="size-4" />,
        description: t("import.sales_point.select_required"),
      });
      return;
    }
    setStep("upload");
    const createdJob = await upload(
      file,
      dataType,
      isAdmin ? selectedSalesPointId : undefined
    );
    if (createdJob) {
      setActiveJobId(createdJob.id);
      onJobCreated?.(createdJob);
      setStep("processing");
    } else {
      setStep("upload");
    }
  }, [file, dataType, isAdmin, selectedSalesPointId, upload, onJobCreated, t]);

  const handlePreflightDecision = useCallback(
    async (decision: "auto_create" | "cancel") => {
      await sendPreflightDecision(decision);
      if (decision === "cancel") {
        toast({
          title: t("import.toast.cancelled"),
          variant: "default",
        });
      } else {
        toast({
          title: t("import.toast.creating_dependencies"),
          variant: "default",
        });
      }
    },
    [sendPreflightDecision, t]
  );

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
        title: decision === "update"
          ? t("import.toast.entry_replaced")
          : t("import.toast.row_skipped"),
        variant: "default",
      });
    },
    [activeJobId, connected, sendResolveConflict, t]
  );

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
    ? (job.pending_conflicts as ConflictItem[])
    : [];

  const canImport = !!file && (!isAdmin || !!selectedSalesPointId);
  const dataTypeLabel = dataType ? t(DATA_TYPE_LABEL_KEYS[dataType]) : "";

  if (step === "select-type") {
    return (
      <div className="space-y-5">
        <div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("import.wizard.select_type")}
          </p>
        </div>

        <DataTypeSelector value={dataType} onChange={setDataType} />

        {dataType && (
          <div className="space-y-3 animate-slide-in">
            <TemplateDownload dataType={dataType} />

            {isAdmin && (
              <Combobox
                options={salesPoints}
                value={salesPoints.find((sp) => sp.id === selectedSalesPointId) ?? null}
                getOptionLabel={(sp) => sp.name}
                getOptionValue={(sp) => sp.id.toString()}
                placeholder={t("import.sales_point.search")}
                buttonLabel={t("import.sales_point.choose")}
                RightIcon={ChevronDown}
                onValueChange={(sp) => setSelectedSalesPointId(sp?.id ?? null)}
              />
            )}

            {!isAdmin && user?.sales_point && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <MapPin size={12} className="shrink-0 text-primary" />
                {t("import.sales_point.import_to")} <span className="font-medium text-foreground">{user.sales_point.name}</span>
              </div>
            )}

            <div>
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                {t("import.wizard.file")}
              </h2>
              <FileDropzone file={file} onFile={setFile} onClear={() => setFile(null)} />
            </div>

            <Button variant={'primary'} onClick={handleStart} disabled={!canImport} className="w-full flex items-center justify-between" size="lg">
              <div></div>
              <span>
                {t("import.wizard.import_button", { type: dataTypeLabel })}
              </span>
              <ArrowRight size={15} />
            </Button>

            {isAdmin && !selectedSalesPointId && file && (
              <p className="text-center text-xs text-muted-foreground">
                {t("import.sales_point.required")}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (step === "upload") {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {t("import.wizard.upload_title")}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{file?.name}</p>
        </div>

        <UploadProgress phase={phase} uploadProgress={uploadProgress} error={error} />

        {columnErrors && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle size={14} />
                <span className="text-sm font-semibold">
                  {t("import.wizard.incompatible_columns")}
                </span>
              </div>
              <ul className="space-y-1">
                {columnErrors.errors.map((columnError, i) => (
                  <li key={i} className="text-xs text-destructive/90 flex gap-1.5">
                    <span>*</span><span>{columnError}</span>
                  </li>
                ))}
              </ul>
              {columnErrors.expected_columns.length > 0 && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer font-medium text-foreground mb-2">
                    {t("import.wizard.expected_columns")}
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
            <RotateCcw size={14} /> {t("import.wizard.retry")}
          </Button>
        )}
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {job?.status === "paused" ? t("import.wizard.action_required") : t("import.wizard.processing")}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {job?.status === "paused"
              ? t("import.wizard.paused_hint")
              : t("import.wizard.realtime_tracking")}
            {job?.sales_point_name && (
              <> - <MapPin size={10} className="inline" /> {job.sales_point_name}</>
            )}
          </p>
        </div>

        {job && (
          <Card>
            <CardContent className="pt-5">
              <LiveProcessingPanel job={job} connected={connected} />
            </CardContent>
          </Card>
        )}

        {job?.status === "paused" && preflightReport && (
          <PreflightDialog report={preflightReport} onDecision={handlePreflightDecision} />
        )}

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

  if (step === "done" && job) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-emerald-600">
            <CheckCircle2 size={35} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {t("import.wizard.done_title")}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("import.wizard.done_description", { count: job.success_rows.toLocaleString() })}
              {job.error_rows > 0 && (
                <> - {t(job.error_rows > 1 ? "import.wizard.done_errors_plural" : "import.wizard.done_errors", { count: job.error_rows })}</>
              )}
              {job.sales_point_name && (
                <> - {job.sales_point_name}</>
              )}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-5 bg-background/70 rounded-lg">
            <LiveProcessingPanel job={job} connected={false} />
          </CardContent>
        </Card>

        <Button variant="outline" onClick={handleReset} className="w-full">
          <RotateCcw size={14} /> {t("import.page.new_import")}
        </Button>
      </div>
    );
  }

  return null;
}
