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

export interface PresignedUrlResponse {
  upload_url: string;
  fields: Record<string, string>;
  s3_key: string;
  sales_point_id: number;
}

export interface SalesPoint {
  id: number;
  name: string;
  address?: string | null;
}

export type SalesPointsResponse = SalesPoint[];

export interface ColumnValidationResponse {
  valid: boolean;
  errors: string[];
  expected_columns: Array<{ name: string; label: string; required: boolean }>;
}

export type UserType = "admin" | "manager" | "employee";

export const DATA_TYPE_LABEL_KEYS: Record<DataType, string> = {
  category: "import.data_types.category.label",
  client_category: "import.data_types.client_category.label",
  supplier: "import.data_types.supplier.label",
  packaging: "import.data_types.packaging.label",
  client: "import.data_types.client.label",
  product: "import.data_types.product.label",
  product_variant: "import.data_types.product_variant.label",
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

export const DATA_TYPE_DESCRIPTION_KEYS: Record<DataType, string> = {
  category: "import.data_types.category.description",
  client_category: "import.data_types.client_category.description",
  supplier: "import.data_types.supplier.description",
  packaging: "import.data_types.packaging.description",
  client: "import.data_types.client.description",
  product: "import.data_types.product.description",
  product_variant: "import.data_types.product_variant.description",
};
