"use client";

import axios, { AxiosError } from "axios";
import SecureLS from "secure-ls";
import type {
  DataType,
  ImportJob,
  PresignedUrlResponse,
  SalesPoint,
  ColumnValidationResponse,
} from "./types";
import { instance } from "@/components/fetch";
import API_URL from "@/config";

// ── SecureLS (côté client uniquement) ─────────────────────────────
let ls: SecureLS | null = null;

if (typeof window !== "undefined") {
  ls = new SecureLS({
    encodingType: "aes",
    encryptionSecret: "interact-app",
  });
}


// ── Helpers token publics (pour le WebSocket) ──────────────────────
export function getAccessToken(): string | null {
  if (typeof window === "undefined" || !ls) return null;
  return ls.get("accessToken") || null;
}

// ── Import API ─────────────────────────────────────────────────────

/**
 * Récupère la liste des points de vente de l'entreprise.
 * Uniquement accessible aux admins.
 */
export async function getSalesPoints(): Promise<SalesPoint[]> {
  const { data } = await instance.get<SalesPoint[]>("/import/sales-points/");
  return data;
}

/**
 * Génère une URL de pré-signature S3.
 * - admin   : sales_point_id obligatoire
 * - manager : sales_point_id ignoré (le backend utilise son propre point de vente)
 */
export async function getPresignedUrl(
  dataType: DataType,
  filename: string,
  fileSize: number,
  salesPointId?: number | null
): Promise<PresignedUrlResponse> {
  const { data } = await instance.post<PresignedUrlResponse>(
    "/import/presigned-url/",
    {
      data_type: dataType,
      filename,
      file_size: fileSize,
      ...(salesPointId != null ? { sales_point_id: salesPointId } : {}),
    }
  );
  return data;
}

export async function uploadToS3(
  presigned: PresignedUrlResponse,
  file: File,
  onProgress?: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    Object.entries(presigned.fields).forEach(([k, v]) =>
      formData.append(k, v)
    );
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", presigned.upload_url);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`S3 upload échoué : ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error("Erreur réseau lors de l'upload S3"));
    xhr.send(formData);
  });
}

/**
 * Valide les colonnes d'un fichier déjà uploadé sur S3.
 * Utile pour un retour d'erreur immédiat avant de démarrer le traitement.
 */

export async function validateColumns(
  dataType: DataType,
  s3Key: string
): Promise<ColumnValidationResponse> {
  const { data } = await instance.post<ColumnValidationResponse>(
    "/import/validate-columns/",
    { data_type: dataType, s3_key: s3Key }
  );
  return data;
}


export async function startImport(
  dataType: DataType,
  s3Key: string,
  originalFilename: string,
  salesPointId?: number | null
): Promise<ImportJob> {
  const { data } = await instance.post<ImportJob>("/import/start/", {
    data_type: dataType,
    s3_key: s3Key,
    original_filename: originalFilename,
    ...(salesPointId != null ? { sales_point_id: salesPointId } : {}),
  });
  return data;
}

export async function getImportJob(jobId: string): Promise<ImportJob> {
  const { data } = await instance.get<ImportJob>(`/import/${jobId}/`);
  return data;
}

export async function getImportHistory(
  dataType?: DataType,
  limit = 50
): Promise<ImportJob[]> {
  const params = new URLSearchParams();
  if (dataType) params.set("data_type", dataType);
  params.set("limit", String(limit));
  const { data } = await instance.get<ImportJob[]>(
    `/import/history/?${params}`
  );
  return data;
}

export async function resolveConflict(
  jobId: string,
  rowIndex: number,
  decision: "update" | "skip"
): Promise<void> {
  await instance.post(`/import/${jobId}/resolve/`, {
    row_index: rowIndex,
    decision,
  });
}

export function getTemplateUrl(dataType: DataType): string {
  return `${API_URL}/import/template/${dataType}/`;
}

export function createImportWebSocket(jobId: string): WebSocket {
  // NEXT_PUBLIC_WS_URL est la seule source de vérité pour l'URL WebSocket.
  // WS_URL (ws.js) n'est pas importé ici — on lit directement la variable d'env.
  const wsBase = process.env.NEXT_PUBLIC_WS_URL ?? "wss://api.inventoryflow.site";
  const token = getAccessToken();
  const url = token
    ? `${wsBase}/ws/import/${jobId}/?token=${token}`
    : `${wsBase}/ws/import/${jobId}/`;
  return new WebSocket(url);
}

import { useTranslation } from "react-i18next";

export function useTemplateDownload() {
  const { t } = useTranslation();

  const downloadTemplate = (dataType: DataType, columns: ExpectedColumn[]) => {
    // Résoudre chaque label via i18next
    const headers = columns.map(col =>
      t(`import.fields.${dataType}.${col.name}`, { defaultValue: col.label })
    );
    const required = columns.map(col =>
      `${col.required ? "* " : ""}${t(`import.fields.${dataType}.${col.name}`, { defaultValue: col.label })}`
    );

    const rows = [headers, required.map(d => `# ${d}`)];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(";")).join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `template_${dataType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return { downloadTemplate };
}