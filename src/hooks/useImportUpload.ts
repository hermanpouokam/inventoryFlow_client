"use client";

import { useState, useCallback } from "react";
import type { DataType, ImportJob } from "@/lib/types";
import {
  getPresignedUrl,
  uploadToS3,
  validateColumns,
  startImport,
} from "@/lib/api";

export type UploadPhase =
  | "idle"
  | "preparing"
  | "uploading"
  | "validating"
  | "starting"
  | "done"
  | "error";

export interface ColumnError {
  errors: string[];
  expected_columns: Array<{ name: string; label: string; required: boolean }>;
}

export function useImportUpload() {
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [columnErrors, setColumnErrors] = useState<ColumnError | null>(null);
  const [job, setJob] = useState<ImportJob | null>(null);

  const upload = useCallback(
    async (
      file: File,
      dataType: DataType,
      /** undefined pour un manager (le backend le résout) ; number pour un admin */
      salesPointId?: number | null
    ): Promise<ImportJob | null> => {
      setPhase("preparing");
      setError(null);
      setColumnErrors(null);
      setUploadProgress(0);
      setJob(null);

      try {
        // 1. Obtenir l'URL pré-signée (+ transmission du sales_point_id si admin)
        const presigned = await getPresignedUrl(
          dataType,
          file.name,
          file.size,
          salesPointId
        );

        // 2. Upload vers S3
        setPhase("uploading");
        await uploadToS3(presigned, file, (pct) => {
          setUploadProgress(pct);
        });

        // 3. Validation des colonnes CSV (feedback immédiat avant le job Celery)
        if (file.name.toLowerCase().endsWith(".csv")) {
          setPhase("validating");
          const validation = await validateColumns(dataType, presigned.s3_key);
          if (!validation.valid) {
            setColumnErrors({
              errors: validation.errors,
              expected_columns: validation.expected_columns,
            });
            setPhase("error");
            setError("Le fichier ne correspond pas au modèle attendu.");
            return null;
          }
        }

        // 4. Démarrer le job d'import
        setPhase("starting");
        const newJob = await startImport(
          dataType,
          presigned.s3_key,
          file.name,
          salesPointId
        );
        setJob(newJob);
        setPhase("done");
        return newJob;
      } catch (err: unknown) {
        // Récupère le message d'erreur Django si disponible
        const axiosErr = err as {
          response?: { data?: { error?: string; column_errors?: string[] } };
          message?: string;
        };
        const serverMsg =
          axiosErr?.response?.data?.error ||
          (axiosErr?.response?.data?.column_errors || []).join(" · ") ||
          (err instanceof Error ? err.message : "Erreur inconnue");

        // Si le backend renvoie des erreurs de colonnes (startImport peut aussi bloquer)
        if (axiosErr?.response?.data?.column_errors) {
          setColumnErrors({
            errors: axiosErr.response.data.column_errors,
            expected_columns:
              (axiosErr.response.data as unknown as {
                expected_columns?: Array<{
                  name: string;
                  label: string;
                  required: boolean;
                }>;
              })?.expected_columns ?? [],
          });
        }

        setError(serverMsg);
        setPhase("error");
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setUploadProgress(0);
    setError(null);
    setColumnErrors(null);
    setJob(null);
  }, []);

  return { phase, uploadProgress, error, columnErrors, job, upload, reset };
}