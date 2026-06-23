"use client";

import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DataType } from "@/lib/types";
import { DATA_TYPE_LABEL_KEYS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { instance } from "../fetch";
import CardBodyContent from "../CardContent";

interface TemplateDownloadProps {
  dataType: DataType | null;
}

export function TemplateDownload({ dataType }: TemplateDownloadProps) {
  const { t } = useTranslation("common");

  if (!dataType) return null;

  const handleDownload = async () => {
    const response = await instance.get("/import/template/" + dataType + "/", {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(response.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-" + dataType + ".csv";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <CardBodyContent className="flex items-center justify-between bg-background/70">
      <div>
        <p className="text-sm font-medium text-foreground">
          {t("import.template.title", { type: t(DATA_TYPE_LABEL_KEYS[dataType]) })}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {t("import.template.description")}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={handleDownload}>
        <Download size={13} />
        {t("import.template.download")}
      </Button>
    </CardBodyContent>
  );
}
