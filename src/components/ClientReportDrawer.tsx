"use client";

// components/ClientReportDrawer.tsx
// Drawer latéral affichant le rapport détaillé d'un client (plan Pro).
// KPIs + segment RFM + bouton PDF.

import { useEffect, useState } from "react";
import { instance } from "@/components/fetch";
import { formatteCurrency } from "@/app/(admin)/stock/functions";
import { X, Download, FileBarChart, ShoppingBag, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface ClientReport {
  client_id: number;
  client_name: string;
  period: { start: string; end: string };
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  last_order_date: string | null;
  favorite_products: { name: string; quantity: number }[];
  revenue_by_period: { period: string; revenue: number }[];
}

interface RfmData {
  segment: string;
  recency_days: number;
  frequency: number;
  monetary: number;
  score: number;
}

const RFM_SEGMENT: Record<string, { labelKey: string; color: string }> = {
  champion: { labelKey: "customers.rfm.champion", color: "text-purple-700 bg-purple-50 border-purple-200" },
  loyal: { labelKey: "customers.rfm.loyal", color: "text-blue-700 bg-blue-50 border-blue-200" },
  at_risk: { labelKey: "customers.rfm.at_risk", color: "text-amber-700 bg-amber-50 border-amber-200" },
  lost: { labelKey: "customers.rfm.lost", color: "text-red-600 bg-red-50 border-red-200" },
  new: { labelKey: "customers.rfm.new", color: "text-green-700 bg-green-50 border-green-200" },
  promising: { labelKey: "customers.rfm.promising", color: "text-teal-700 bg-teal-50 border-teal-200" },
  hibernating: { labelKey: "customers.rfm.hibernating", color: "text-gray-500 bg-gray-50 border-gray-200" },
};

interface Props {
  clientId: number;
  clientName: string;
  rfm: RfmData | null;
  open: boolean;
  onClose: () => void;
}

export default function ClientReportDrawer({ clientId, clientName, rfm, open, onClose }: Props) {
  const [report, setReport] = useState<ClientReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation("common");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    instance
      .get(`/reports/client/${clientId}/`)
      .then((res) => setReport(res.data))
      .catch(() => setError(t("report.client.load_error")))
      .finally(() => setLoading(false));
  }, [open, clientId]);

  const handleDownloadPDF = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/reports/client/${clientId}/pdf/`,
      "_blank"
    );
  };

  const rfmStyle = rfm?.segment ? (RFM_SEGMENT[rfm.segment] ?? { labelKey: rfm.segment, color: "text-gray-500 bg-gray-50 border-gray-200" }) : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 z-50 h-full w-full max-w-xl bg-background border-l border-border shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <FileBarChart className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold">{t("report.title", { name: clientName })}</h2>
                  <p className="text-xs text-muted-foreground">{t("report.last_30_days")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </Button>
                <button onClick={onClose} className="rounded-md p-1.5 hover:bg-muted transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Segment RFM */}
              {rfm && rfmStyle && (
                <div className={cn("rounded-xl border p-4 flex items-start gap-4", rfmStyle.color)}>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{t("report.rfm.segment")} : {RFM_SEGMENT[rfm.segment] ? t(rfmStyle.labelKey) : rfm.segment}</span>
                    </div>
                    <div className="flex gap-4 text-xs mt-2">
                      <span><strong>{t("report.rfm.recency")}</strong> : {rfm.recency_days}j</span>
                      <span><strong>{t("report.rfm.frequency")}</strong> : {rfm.frequency} cmd</span>
                      <span><strong>{t("report.rfm.monetary")}</strong> : {formatteCurrency(rfm.monetary)}</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{rfm.score}/5</div>
                </div>
              )}

              {loading && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              {report && !loading && (
                <>
                  {/* KPIs */}
                  <div className="grid grid-cols-2 gap-3">
                    <KPICard label={t("report.kpi.revenue")} value={formatteCurrency(report.total_revenue)} icon={TrendingUp} highlight />
                    <KPICard label={t("report.client.total_orders")} value={`${report.total_orders}`} icon={ShoppingBag} />
                    <KPICard label={t("report.client.avg_order")} value={formatteCurrency(report.average_order_value)} icon={TrendingUp} />
                    <KPICard
                      label={t("report.client.last_order")}
                      value={report.last_order_date ? new Date(report.last_order_date).toLocaleDateString("fr-FR") : "—"}
                      icon={Calendar}
                    />
                  </div>

                  {/* Produits favoris */}
                  {report.favorite_products?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-3">{t("report.client.favorite_products")}</p>
                      <div className="space-y-2">
                        {report.favorite_products.slice(0, 5).map((p, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm">
                            <span className="text-foreground">{p.name}</span>
                            <span className="text-xs text-muted-foreground">{p.quantity} {t("units")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function KPICard({ label, value, icon: Icon, highlight = false }: { label: string; value: string; icon: any; highlight?: boolean }) {
  return (
    <div className={cn("rounded-xl border p-4 space-y-2", highlight ? "border-primary/20 bg-primary/5" : "border-border bg-card")}>
      <div className="flex items-center gap-2">
        <Icon className={cn("w-4 h-4", highlight ? "text-primary" : "text-muted-foreground")} />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className={cn("text-lg font-semibold", highlight ? "text-primary" : "text-foreground")}>{value}</p>
    </div>
  );
}
