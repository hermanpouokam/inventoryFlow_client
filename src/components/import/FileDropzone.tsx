"use client";

import { useCallback, useState, useRef } from "react";
import { UploadCloud, FileSpreadsheet, X, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn, formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ACCEPTED = [".csv", ".xlsx"];
const MAX_SIZE = 10 * 1024 * 1024;

interface FileDropzoneProps {
  file: File | null;
  onFile: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function FileDropzone({
  file,
  onFile,
  onClear,
  disabled,
}: FileDropzoneProps) {
  const { t } = useTranslation("common");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback(
    (f: File): string | null => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      if (!["csv", "xlsx"].includes(ext || "")) {
        return t("import.file.errors.unsupported");
      }
      if (f.size > MAX_SIZE) {
        return t("import.file.errors.too_large", { size: formatFileSize(MAX_SIZE) });
      }
      return null;
    },
    [t]
  );

  const handleFile = useCallback(
    (f: File) => {
      const err = validate(f);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      onFile(f);
    },
    [validate, onFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  if (file) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    return (
      <div className="flex items-center gap-3 rounded-lg border-2 border-dashed border-primary/50 bg-background/70 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
          <FileSpreadsheet size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {file.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {ext?.toUpperCase()} - {formatFileSize(file.size)}
          </p>
        </div>
        {!disabled && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "group relative flex w-full flex-col items-center justify-center bg-background/70 gap-3 rounded-xl border-2 border-dashed py-10 transition-all duration-150 focus:outline-none",
          dragging
            ? "border-primary bg-accent/60 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
            dragging
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground group-hover:text-foreground"
          )}
        >
          <UploadCloud size={22} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {t("import.file.drop_prompt")}{" "}
            <span className="text-primary underline-offset-2 hover:underline">
              {t("import.file.browse")}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("import.file.accepted", { size: formatFileSize(MAX_SIZE) })}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          onChange={onInputChange}
        />
      </button>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertCircle size={13} />
          {error}
        </div>
      )}
    </div>
  );
}
