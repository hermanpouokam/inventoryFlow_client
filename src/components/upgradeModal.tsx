"use client";

import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Method = "card" | "mtn" | "orange";

interface Props {
  onClose: () => void;
  onConfirm?: (data: { method: Method; country?: string; phone?: string }) => void;
}

export function PaymentMethodModal({ onConfirm, onClose }: Props) {
  const { t } = useTranslation("common");

  void onConfirm;
  void onClose;

  return (
    <Card>
      <CardHeader className="pt-6 pb-4 border-b border-border">
        <CardTitle className="text-lg">{t("payment_method_modal.title")}</CardTitle>
        <CardDescription>
          {t("payment_method_modal.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 gap-0 overflow-hidden" />
    </Card>
  );
}
