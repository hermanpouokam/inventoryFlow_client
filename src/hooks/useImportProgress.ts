"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ImportJob, ProgressEvent } from "@/lib/types";
import type { PreflightReport } from "@/components/import/Preflightdialog";
import { createImportWebSocket, getImportJob } from "@/lib/api";
import { instance as api } from "@/components/fetch"

interface UseImportProgressOptions {
  jobId: string | null;
  onComplete?: (job: ImportJob) => void;
  onError?: (error: string) => void;
}

export function useImportProgress({
  jobId,
  onComplete,
  onError,
}: UseImportProgressOptions) {
  const [job, setJob] = useState<ImportJob | null>(null);
  const [connected, setConnected] = useState(false);
  const [preflightReport, setPreflightReport] = useState<PreflightReport | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const jobIdRef = useRef<string | null>(null);
  const stoppedRef = useRef(false); // ← verrou : empêche tout retry/callback après terminal
  const onCompleteRef = useRef(onComplete); // ← refs stables pour éviter de recréer connect
  const onErrorRef = useRef(onError);

  // Maintenir les refs à jour sans recréer connect
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const connect = useCallback((id: string) => {
    if (stoppedRef.current) return;
    if (wsRef.current) wsRef.current.close();

    const ws = createImportWebSocket(id);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      retryRef.current = 0;
    };

    ws.onmessage = (e) => {
      if (stoppedRef.current) return; // ignorer les messages après terminal

      try {
        const event: ProgressEvent & { preflightReport?: PreflightReport } =
          JSON.parse(e.data);

        setJob((prev) => ({
          id: event.jobId,
          data_type: prev?.data_type ?? ("" as ImportJob["data_type"]),
          original_filename: prev?.original_filename ?? "",
          file_size: prev?.file_size ?? 0,
          sales_point_id: prev?.sales_point_id ?? null,
          sales_point_name: prev?.sales_point_name ?? null,
          created_at: prev?.created_at ?? null,
          updated_at: prev?.updated_at ?? null,
          // errors et pending_conflicts sont maintenant inclus dans chaque payload WS
          errors: event.errors ?? prev?.errors ?? [],
          pending_conflicts: event.pendingConflicts ?? prev?.pending_conflicts ?? 0,
          status: event.status,
          progress: event.progress ?? prev?.progress ?? 0,
          total_rows: event.totalRecords ?? prev?.total_rows ?? 0,
          processed_rows: event.processedRecords ?? prev?.processed_rows ?? 0,
          success_rows: event.successfulRecords ?? prev?.success_rows ?? 0,
          error_rows: event.failedRecords ?? prev?.error_rows ?? 0,
          timeline: event.timeline ?? prev?.timeline ?? [],
        }));

        if (event.preflightReport) {
          setPreflightReport(event.preflightReport);
        }
        if (event.status === "processing" && !event.preflightReport) {
          setPreflightReport(null);
        }

        if (event.status === "completed") {
          stoppedRef.current = true; // ← verrouiller avant tout callback
          ws.close(1000, "completed");
          getImportJob(event.jobId).then((fullJob) => {
            setJob(fullJob);
            onCompleteRef.current?.(fullJob); // ← ref stable, pas de boucle
          });
        }

        if (event.status === "failed") {
          stoppedRef.current = true; // ← verrouiller avant tout callback
          ws.close(1000, "failed");
          getImportJob(event.jobId).then(setJob);
          onErrorRef.current?.(event.error ?? "Import échoué"); // ← ref stable
        }
      } catch (err) {
        console.error("WS parse error", err);
      }
    };

    ws.onclose = (e) => {
      setConnected(false);
      // Retry uniquement si : fermeture non-propre ET job non terminal
      if (!stoppedRef.current && e.code !== 1000 && retryRef.current < 5) {
        const delay = Math.pow(2, retryRef.current) * 1000;
        retryRef.current++;
        setTimeout(() => connect(id), delay);
      }
    };

    ws.onerror = () => setConnected(false);
  }, []); // ← dépendances vides : connect ne change jamais de référence

  useEffect(() => {
    if (!jobId) return;

    // Reset du verrou à chaque nouveau jobId
    stoppedRef.current = false;
    retryRef.current = 0;
    jobIdRef.current = jobId;

    getImportJob(jobId)
      .then((fullJob) => {
        setJob(fullJob);
        if (fullJob.preflight_report) {
          setPreflightReport(fullJob.preflight_report as PreflightReport);
        }
        // Job déjà terminal au chargement : callback unique, pas de WS
        if (fullJob.status === "completed" || fullJob.status === "failed") {
          stoppedRef.current = true;
          if (fullJob.status === "completed") onCompleteRef.current?.(fullJob);
          if (fullJob.status === "failed") onErrorRef.current?.("Import échoué");
          return;
        }
        connect(jobId);
      })
      .catch(console.error);

    return () => {
      stoppedRef.current = true;
      wsRef.current?.close(1000, "component unmount");
    };
  }, [jobId, connect]);

  const sendResolveConflict = useCallback(
    (rowIndex: number, decision: "update" | "skip") => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ action: "resolve_conflict", row_index: rowIndex, decision })
        );
      }
    },
    []
  );

  const sendPreflightDecision = useCallback(
    async (decision: "auto_create" | "cancel") => {
      if (!jobIdRef.current) return;
      await api.post(`/import/${jobIdRef.current}/preflight-decision/`, { decision });
    },
    []
  );

  return { job, connected, preflightReport, sendResolveConflict, sendPreflightDecision };
}