"use client";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import { Mail } from "lucide-react";

export function SiteFooter() {
  const { t } = useTranslation("legal");
  const common = t("common", { returnObjects: true }) as Record<string, string>;

  return (
    <footer className="mt-20 border-t border-hairline bg-surface">
      <div className="container py-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">{common.footerNote}</p>
          <a
            href={`mailto:${common.footerContact}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          >
            <Mail className="h-4 w-4" />
            {common.footerContact}
          </a>
        </div>
      </div>
    </footer>
  );
}
