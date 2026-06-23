import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ImportStatus } from "./types";

type Translate = (key: string, options?: Record<string, unknown>) => string;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 o";
  const k = 1024;
  const sizes = ["o", "Ko", "Mo", "Go"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatRelativeTime(iso: string | null, t?: Translate): string {
  if (!iso) return "-";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t ? t("time.relative.now") : "now";
  if (minutes < 60) {
    return t ? t("time.relative.minutes", { count: minutes }) : minutes + " min ago";
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return t ? t("time.relative.hours", { count: hours }) : hours + "h ago";
  }
  const days = Math.floor(hours / 24);
  return t ? t("time.relative.days", { count: days }) : days + "d ago";
}

export const STATUS_CONFIG: Record<
  ImportStatus,
  { labelKey: string; color: string; bg: string; dot: string }
> = {
  pending: {
    labelKey: "import.status.pending",
    color: "text-muted-foreground",
    bg: "bg-muted",
    dot: "bg-muted-foreground",
  },
  processing: {
    labelKey: "import.status.processing",
    color: "text-primary",
    bg: "bg-accent",
    dot: "bg-primary animate-pulse",
  },
  completed: {
    labelKey: "import.status.completed",
    color: "text-success",
    bg: "bg-success/10",
    dot: "bg-success",
  },
  failed: {
    labelKey: "import.status.failed",
    color: "text-destructive",
    bg: "bg-destructive/10",
    dot: "bg-destructive",
  },
  paused: {
    labelKey: "import.status.paused",
    color: "text-warning",
    bg: "bg-warning/10",
    dot: "bg-warning",
  },
};
