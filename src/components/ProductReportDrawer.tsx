"use client";

import { useEffect, useState } from "react";
import { instance } from "@/components/fetch";
import { formatteCurrency } from "@/app/(admin)/stock/functions";
import { X, Download, TrendingUp, TrendingDown, Minus, FileBarChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import CardBodyContent from "./CardContent";
import { DateRange } from "react-day-picker";
import moment from "moment";

interface ProductReport {
  product_id: number;
  product_name: string;
  period: { start: string; end: string };
  total_revenue: number;
  total_profit: number;
  total_quantity_sold: number;
  average_ticket: number;
  sales_by_period: { period: string; revenue: number; quantity: number }[];
  evolution_pct: number | null;
}

interface Props {
  productId: number;
  productName: string;
  open: boolean;
  pickedDateRange: DateRange
}

export default function ProductReportDrawer({ productId, productName, pickedDateRange, open, }: Props) {
  const [report, setReport] = useState<ProductReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation("common");

  const getDateParams = () => ({
    start_date: moment(pickedDateRange?.from).format("YYYY-MM-DD"),
    end_date: moment(pickedDateRange?.to).format("YYYY-MM-DD"),
  });

  const fetchReport = () => {
    setLoading(true);
    setError(null);
    instance
      .get(`/reports/product/${productId}/`,
        {
          params: getDateParams(),
        }
      )
      .then((res) => {
        setReport(res.data)
      })
      .catch(() => setError(t("report.product.load_error")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!open) return;
    fetchReport();
  }, [open, productId, pickedDateRange]);


  const isSingleDay =
    pickedDateRange?.from &&
    pickedDateRange?.to &&
    moment(pickedDateRange.from).isSame(moment(pickedDateRange.to), "day");

  const evolution = report?.evolution_pct ?? null;
  const EvolutionIcon =
    evolution === null ? Minus : evolution > 0 ? TrendingUp : TrendingDown;
  const evolutionColor =
    evolution === null
      ? "text-muted-foreground"
      : evolution > 0
        ? "text-green-600"
        : "text-red-500";

  return (

    <>
      {/* Content */}
      <div className="flex-1 overflow-y-auto py-5 space-y-6">

        {loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-48 rounded-xl" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {report && !loading && (
          <>
            <div className="grid grid-cols-4 gap-3">
              <KPICard
                label={t("report.kpi.revenue")}
                value={formatteCurrency(report.summary.total_revenue)}
              />
              <KPICard
                label={t("report.kpi.profit")}
                value={formatteCurrency(report.summary.total_gross_profit)}
                highlight
              />
              <KPICard
                label={t("report.kpi.quantity_sold")}
                value={`${report.summary.total_quantity_sold} ${t("units")}`}
              />
              <KPICard
                label={t("report.kpi.sold")}
                value={report.summary.total_quantity_sold}
              />
              <button className="hidden" id="getReport" onClick={fetchReport}></button>
            </div>

            {evolution !== null && (
              <div className={`flex items-center gap-2 text-sm ${evolutionColor}`}>
                <EvolutionIcon className="h-4 w-4" />
                <span>{t("report.evolution_vs_previous_period", { value: `${evolution > 0 ? "+" : ""}${evolution.toFixed(1)}` })}</span>
              </div>
            )}

            <CardBodyContent>
              {report.daily_sales?.length > 0 && (
                <>
                  <p className="text-md font-medium text-foreground mb-4">
                    {t("report.sales_chart")}
                  </p>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={report.daily_sales}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.18} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                          axisLine={false}
                          tickLine={false}
                          tickMargin={8}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                          width={40}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--background)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 12,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                          }}
                          labelStyle={{ color: "var(--muted-foreground)", marginBottom: 4 }}
                          formatter={(value: number) => [
                            `${value.toLocaleString()} FCFA`,
                            t("report.kpi.revenue"),
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2.5}
                          fill="url(#revenueGradient)"
                          dot={{ r: 0 }}
                          activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
                          name={t("report.kpi.revenue")}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </CardBodyContent>
          </>
        )}
      </div>
    </>

  );
}

function KPICard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 space-y-1 ${highlight ? "border-primary/20 bg-primary/5" : "border-border bg-card"}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}