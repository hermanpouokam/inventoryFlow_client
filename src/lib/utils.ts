import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ImportStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 o";
  const k = 1024;
  const sizes = ["o", "Ko", "Mo", "Go"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

export const STATUS_CONFIG: Record<
  ImportStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  pending: {
    label: "En attente",
    color: "text-muted-foreground",
    bg: "bg-muted",
    dot: "bg-muted-foreground",
  },
  processing: {
    label: "En cours",
    color: "text-primary",
    bg: "bg-accent",
    dot: "bg-primary animate-pulse",
  },
  completed: {
    label: "Terminé",
    color: "text-success",
    bg: "bg-success/10",
    dot: "bg-success",
  },
  failed: {
    label: "Échoué",
    color: "text-destructive",
    bg: "bg-destructive/10",
    dot: "bg-destructive",
  },
  paused: {
    label: "En pause",
    color: "text-warning",
    bg: "bg-warning/10",
    dot: "bg-warning",
  },
};
