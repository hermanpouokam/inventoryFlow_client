/**
 * importService.js
 *
 * Utilitaire frontend complet pour le flux d'import CSV/XLSX.
 * Gère : parse local → validation → upload S3 direct → suivi WS temps réel.
 *
 * Dépendances : SheetJS (xlsx) — https://sheetjs.com/
 * import * as XLSX from 'xlsx';
 */

// ─── Colonnes requises par type (miroir du backend) ───────────────────────────
const SCHEMA = {
  category:        { required: ["name"], optional: ["ab_name"] },
  client_category: { required: ["name"], optional: [] },
  supplier:        { required: ["name"], optional: ["email", "contact", "ab_name"] },
  packaging:       { required: ["name", "price", "supplier_name"], optional: ["full_quantity", "empty_quantity"] },
  client:          { required: ["name", "client_category"], optional: ["surname", "number", "email", "address"] },
  product:         { required: ["name", "category", "supplier_name", "price", "quantity"], optional: ["product_code", "sell_price", "is_beer", "packaging"] },
  product_variant: { required: ["product_name", "variant_name", "category", "supplier_name", "price", "quantity"], optional: ["is_beer", "packaging"] },
};

const NUMERIC_FIELDS = ["price", "quantity", "sell_price", "full_quantity", "empty_quantity"];
const MAX_FILE_SIZE  = 10 * 1024 * 1024; // 10 Mo


// ─── Parsing local (SheetJS) ──────────────────────────────────────────────────

/**
 * Parse un fichier CSV ou XLSX et retourne un tableau de dicts.
 * @param {File} file
 * @returns {Promise<{rows: object[], headers: string[]}>}
 */
export async function parseFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Fichier trop volumineux (max 10 Mo). Taille actuelle : ${(file.size / 1024 / 1024).toFixed(2)} Mo`);
  }

  const ext = file.name.split(".").pop().toLowerCase();
  if (!["csv", "xlsx"].includes(ext)) {
    throw new Error("Format non supporté. Utilisez un fichier .csv ou .xlsx");
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", raw: false });
  const sheet    = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows  = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  if (rawRows.length < 2) {
    throw new Error("Le fichier est vide ou ne contient pas d'en-têtes.");
  }

  // Ignore les lignes de commentaires (commencent par #)
  const headers = rawRows[0].map(h => String(h).trim().toLowerCase());
  const dataRows = rawRows
    .slice(1)
    .filter(r => !String(r[0] || "").startsWith("#"))
    .filter(r => r.some(c => String(c).trim() !== ""));

  const rows = dataRows.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = String(row[i] ?? "").trim();
    });
    return obj;
  });

  return { rows, headers };
}


// ─── Validation locale ────────────────────────────────────────────────────────

/**
 * Valide les données parsées selon le schema du data_type.
 * @param {object[]} rows
 * @param {string[]} headers
 * @param {string} dataType
 * @returns {{ valid: boolean, errors: Array<{row: number, field: string, message: string}> }}
 */
export function validateRows(rows, headers, dataType) {
  const schema = SCHEMA[dataType];
  if (!schema) return { valid: false, errors: [{ row: 0, field: "data_type", message: "Type de données inconnu" }] };

  const errors = [];

  // Vérification des colonnes requises dans les headers
  for (const col of schema.required) {
    if (!headers.includes(col)) {
      errors.push({ row: 0, field: col, message: `Colonne obligatoire manquante : "${col}"` });
    }
  }
  if (errors.length > 0) return { valid: false, errors };

  // Vérification de chaque ligne
  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // +2 car header = ligne 1

    // Champs obligatoires non vides
    for (const col of schema.required) {
      if (!row[col] || row[col] === "") {
        errors.push({ row: rowNum, field: col, message: `Champ obligatoire vide : "${col}"` });
      }
    }

    // Validation des champs numériques
    for (const col of NUMERIC_FIELDS) {
      if (col in row && row[col] !== "" && isNaN(Number(row[col]))) {
        errors.push({ row: rowNum, field: col, message: `"${col}" doit être un nombre, valeur reçue : "${row[col]}"` });
      }
    }

    // Détection CSV injection côté client (première ligne de défense)
    const injectionPrefixes = ["=", "+", "-", "@"];
    for (const [col, val] of Object.entries(row)) {
      if (injectionPrefixes.some(p => String(val).startsWith(p))) {
        errors.push({ row: rowNum, field: col, message: `Valeur suspecte (possible injection) dans "${col}" : "${String(val).substring(0, 20)}"` });
      }
    }
  });

  return { valid: errors.length === 0, errors };
}


// ─── Upload S3 direct ─────────────────────────────────────────────────────────

/**
 * Demande une presigned URL au backend puis uploade directement sur S3.
 * Le fichier ne passe JAMAIS par le backend.
 *
 * @param {File} file        — fichier original (non modifié)
 * @param {string} dataType
 * @param {string} apiBase   — ex: "https://api.monapp.com/api"
 * @param {string} authToken — JWT token
 * @returns {Promise<string>} s3_key
 */
export async function uploadToS3(file, dataType, apiBase, authToken) {
  // 1. Obtenir la presigned URL depuis le backend
  const presignedRes = await fetch(`${apiBase}/import/presigned-url/`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      data_type:  dataType,
      filename:   file.name,
      file_size:  file.size,
    }),
  });

  if (!presignedRes.ok) {
    const err = await presignedRes.json();
    throw new Error(err.error || "Erreur lors de la génération de l'URL d'upload");
  }

  const { upload_url, fields, s3_key } = await presignedRes.json();

  // 2. Upload direct vers S3 via multipart/form-data (presigned POST)
  const formData = new FormData();
  Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
  formData.append("file", file); // DOIT être le dernier champ

  const s3Res = await fetch(upload_url, {
    method: "POST",
    body:   formData,
  });

  if (!s3Res.ok) {
    throw new Error(`Erreur upload S3 : ${s3Res.status} ${s3Res.statusText}`);
  }

  return s3_key;
}


// ─── Démarrage de l'import ────────────────────────────────────────────────────

/**
 * Notifie le backend que le fichier est uploadé → lance la tâche Celery.
 * @returns {Promise<string>} job_id
 */
export async function startImport(s3Key, dataType, originalFilename, apiBase, authToken) {
  const res = await fetch(`${apiBase}/import/start/`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      data_type:         dataType,
      s3_key:            s3Key,
      original_filename: originalFilename,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erreur lors du démarrage de l'import");
  }

  const { job_id } = await res.json();
  return job_id;
}


// ─── Suivi en temps réel (WebSocket) ─────────────────────────────────────────

/**
 * Ouvre un WebSocket et écoute la progression de l'import.
 *
 * @param {string} jobId
 * @param {string} wsBase    — ex: "wss://api.monapp.com"
 * @param {object} callbacks — { onProgress, onConflict, onDone, onError }
 * @returns {{ close: () => void, resolveConflict: (rowIndex, decision) => void }}
 */
export function watchImportJob(jobId, wsBase, callbacks) {
  const ws = new WebSocket(`${wsBase}/ws/import/${jobId}/`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.error) {
      callbacks.onError?.(data.error);
      return;
    }

    // Progression normale
    callbacks.onProgress?.({
      progress:         data.progress,
      processed:        data.processed,
      total:            data.total,
      success:          data.success,
      errors:           data.errors,
      errorDetails:     data.error_details || [],
      pendingConflicts: data.pending_conflicts,
      status:           data.status,
    });

    // Conflits en attente
    if (data.pending_conflicts > 0 && data.status === "done") {
      callbacks.onConflict?.(data.pending_conflicts);
    }

    // Terminé
    if (data.status === "done" && data.pending_conflicts === 0) {
      callbacks.onDone?.({
        success: data.success,
        errors:  data.errors,
        errorDetails: data.error_details || [],
      });
    }
  };

  ws.onerror = (e) => {
    callbacks.onError?.("Connexion WebSocket perdue");
  };

  ws.onclose = () => {
    // Reconnexion automatique si le job n'est pas terminé
  };

  return {
    close: () => ws.close(),
    resolveConflict: (rowIndex, decision) => {
      ws.send(JSON.stringify({
        action:    "resolve_conflict",
        row_index: rowIndex,
        decision,          // "update" | "skip"
      }));
    },
  };
}


// ─── Téléchargement du template ───────────────────────────────────────────────

/**
 * Déclenche le téléchargement d'un template CSV pour un data_type donné.
 * @param {string} dataType
 * @param {string} apiBase
 * @param {string} authToken
 */
export async function downloadTemplate(dataType, apiBase, authToken) {
  const res = await fetch(`${apiBase}/import/template/${dataType}/`, {
    headers: { "Authorization": `Bearer ${authToken}` },
  });
  if (!res.ok) throw new Error("Impossible de télécharger le template");

  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `template_${dataType}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}


// ─── Flux complet orchestré ────────────────────────────────────────────────────

/**
 * Orchestre l'import complet :
 * parse → validate → upload S3 → start → watch WS
 *
 * @param {object} params
 * @param {File}     params.file
 * @param {string}   params.dataType
 * @param {string}   params.apiBase        ex: "https://api.monapp.com/api"
 * @param {string}   params.wsBase         ex: "wss://api.monapp.com"
 * @param {string}   params.authToken
 * @param {Function} params.onValidationError  (errors[]) => void
 * @param {Function} params.onUploadStart      () => void
 * @param {Function} params.onImportStart      (jobId) => void
 * @param {Function} params.onProgress         ({progress, processed, total, ...}) => void
 * @param {Function} params.onConflict         (pendingCount) => void
 * @param {Function} params.onDone             ({success, errors, errorDetails}) => void
 * @param {Function} params.onError            (message) => void
 * @returns {Promise<{ jobId: string, watcher: object } | null>}
 */
export async function runImport(params) {
  const {
    file, dataType, apiBase, wsBase, authToken,
    onValidationError, onUploadStart, onImportStart,
    onProgress, onConflict, onDone, onError,
  } = params;

  try {
    // 1. Parse local
    const { rows, headers } = await parseFile(file);

    // 2. Validation locale (aucun appel réseau)
    const { valid, errors } = validateRows(rows, headers, dataType);
    if (!valid) {
      onValidationError?.(errors);
      return null;
    }

    // 3. Upload direct S3
    onUploadStart?.();
    const s3Key = await uploadToS3(file, dataType, apiBase, authToken);

    // 4. Démarrage tâche Celery
    const jobId = await startImport(s3Key, dataType, file.name, apiBase, authToken);
    onImportStart?.(jobId);

    // 5. Suivi WebSocket
    const watcher = watchImportJob(jobId, wsBase, {
      onProgress, onConflict, onDone, onError,
    });

    return { jobId, watcher };

  } catch (err) {
    onError?.(err.message || "Erreur inattendue");
    return null;
  }
}
