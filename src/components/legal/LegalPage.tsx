"use client";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { FileText, Lock } from "lucide-react";
import { useQueryState } from "nuqs";

export function LegalPage() {
  const { t } = useTranslation("legal");
  const nav = t("nav", { returnObjects: true }) as Record<string, string>;
  const [docKey, setDockey] = useQueryState('page', { defaultValue: "terms" })

  return (
    <div className="container py-4 sm:py-4">
      {
        docKey === 'privacy' ?
          <LegalDocument docKey="privacy" />
          :
          <LegalDocument docKey="terms" />
      }
    </div>
  );
}
