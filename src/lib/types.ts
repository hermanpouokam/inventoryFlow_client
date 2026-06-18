import { PreflightReport } from "@/components/import/Preflightdialog";

export type DataType =
  | "category"
  | "client_category"
  | "supplier"
  | "packaging"
  | "client"
  | "product"
  | "product_variant";

export type ImportStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "paused";

export type TimelineStepStatus = "pending" | "active" | "done" | "failed";

export interface TimelineStep {
  id: string;
  label: string;
  status: TimelineStepStatus;
  at: string | null;
}

export interface ImportError {
  row: number | null;
  message: string;
  at: string;
}

export interface ConflictItem {
  row_index: number;
  row_data: Record<string, string>;
  existing_id: string | number;
  existing_name: string;
}

export interface ImportJob {
  id: string;
  data_type: DataType;
  status: ImportStatus;
  progress: number;
  total_rows: number;
  processed_rows: number;
  success_rows: number;
  error_rows: number;
  errors: ImportError[];
  pending_conflicts: number | ConflictItem[];
  original_filename: string;
  file_size: number;
  sales_point_id: number | null;
  sales_point_name: string | null;
  created_at: string | null;
  updated_at: string | null;
  timeline?: TimelineStep[];
  preflight_report?: PreflightReport | null; 

}

export interface ProgressEvent {
  jobId: string;
  status: ImportStatus;
  progress: number;
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  timeline: TimelineStep[];
  error?: string;
}

/** Réponse de POST /api/import/presigned-url/ */
export interface PresignedUrlResponse {
  upload_url: string;
  fields: Record<string, string>;
  s3_key: string;
  sales_point_id: number; // renvoyé par le backend pour confirmation
}

/** Point de vente — utilisé par l'admin pour choisir la destination */
export interface SalesPoint {
  id: number;
  name: string;
  address?: string | null;
}

/** Réponse de GET /api/import/sales-points/ */
export type SalesPointsResponse = SalesPoint[];

/** Réponse de POST /api/import/validate-columns/ */
export interface ColumnValidationResponse {
  valid: boolean;
  errors: string[];
  expected_columns: Array<{ name: string; label: string; required: boolean }>;
}

/** user_type exposé par /api/auth/me/ */
export type UserType = "admin" | "manager" | "employee";

export const DATA_TYPE_LABELS: Record<DataType, string> = {
  category: "Catégories",
  client_category: "Catégories clients",
  supplier: "Fournisseurs",
  packaging: "Emballages",
  client: "Clients",
  product: "Produits",
  product_variant: "Variantes produits",
};

export const DATA_TYPE_ICONS: Record<DataType, string> = {
  category: "tag",
  client_category: "users",
  supplier: "truck",
  packaging: "package",
  client: "user",
  product: "box",
  product_variant: "layers",
};

export const DATA_TYPE_DESCRIPTIONS: Record<DataType, string> = {
  category: "Catégories de produits (ex: Boissons, Alimentaire)",
  client_category: "Types de clients (ex: Grossiste, Détaillant)",
  supplier: "Fournisseurs et leurs coordonnées",
  packaging: "Emballages avec prix et quantités",
  client: "Clients avec contacts et catégories",
  product: "Catalogue produits avec prix et stocks",
  product_variant: "Variantes de produits existants",
};