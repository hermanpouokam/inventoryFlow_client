"use client";

import * as React from "react";
import { instance } from "@/components/fetch";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableDemo } from "@/components/TableComponent";
import { ColumnDef } from "@tanstack/react-table";
import { Package, RefreshCw, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { DateRangePicker } from "@/components/DateRangePicker";
import { datesData } from "@/utils/constants";
import { DateRange } from "react-day-picker";

// ── Config mouvement ───────────────────────────────────────────────────────────

const MOVEMENT_CONFIG: Record<
    string,
    { labelKey: string; className: string }
> = {
    sortie_plein: { labelKey: "packaging.history.movements.full_out", className: "bg-red-100 text-red-700 border-red-200" },
    "entr\u00e9e_plein": { labelKey: "packaging.history.movements.full_in", className: "bg-green-100 text-green-700 border-green-200" },
    sortie_vide: { labelKey: "packaging.history.movements.empty_out", className: "bg-orange-100 text-orange-700 border-orange-200" },
    "entr\u00e9e_vide": { labelKey: "packaging.history.movements.empty_return", className: "bg-blue-100 text-blue-700 border-blue-200" },
    correction: { labelKey: "packaging.history.movements.correction", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

// ?? Colonnes ????????????????????????????????????????????????????????????????

const getColumns = (t: any): ColumnDef<PackagingHistoryEvent>[] => [
    {
        accessorKey: "number",
        header: () => <div className="w-[30px]">#</div>,
        cell: ({ row }) => (
            <div className="text-muted-foreground">{row.getValue("number")}</div>
        ),
    },
    {
        accessorKey: "timestamp",
        header: ({ column }) => (
            <div
                className="flex items-center cursor-pointer select-none"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                {t("date")}
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
        ),
        cell: ({ row }) => (
            <div className="text-sm whitespace-nowrap w-[150px]">
                {moment(row.getValue("timestamp")).format("DD/MM/YY HH:mm")}
            </div>
        ),
    },
    {
        accessorKey: "packaging",
        header: () => <div className="text-center">{t("pdf.packaging_item")}</div>,
        cell: ({ row }) => (
            <div className="font-medium w-[200px] text-center">{row.getValue("packaging")}</div>
        ),
    },
    {
        accessorKey: "product",
        header: () => <div className="text-center">{t("roadmap.excel.product")}</div>,
        cell: ({ row }) => (
            <div className="font-medium w-[200px] text-center">{row.getValue("product")}</div>
        ),
    },
    {
        accessorKey: "movement",
        header: () => <div className="text-center w-[180px]">{t("packaging.history.columns.movement")}</div>,
        cell: ({ row }) => {
            const mv: string = row.getValue("movement");
            const cfg = MOVEMENT_CONFIG[mv] ?? MOVEMENT_CONFIG.correction;
            return (
                <div className="flex justify-center">
                    <span
                        className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            cfg.className
                        )}
                    >
                        {t(cfg.labelKey)}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "full_delta",
        header: () => <div className="text-center w-[100px]">{t("packaging.history.columns.full")}</div>,
        cell: ({ row }) => {
            const val: number = row.getValue("full_delta");
            if (val === 0) return <div className="text-center text-muted-foreground">—</div>;
            return (
                <div
                    className={cn(
                        "text-center font-semibold",
                    )}
                >
                    {val}
                </div>
            );
        },
    },
    {
        accessorKey: "empty_delta",
        header: () => <div className="text-center w-[100px]">{t("packaging.history.columns.empty")}</div>,
        cell: ({ row }) => {
            const val: number = row.getValue("empty_delta");
            if (val === 0) return <div className="text-center text-muted-foreground">—</div>;
            return (
                <div
                    className={cn(
                        "text-center font-semibold",
                    )}
                >
                    {val}
                </div>
            );
        },
    },
    {
        accessorKey: "record",
        header: () => <div className="text-center w-[100px]">{t("invoice.consigned")}</div>,
        cell: ({ row }) => {
            const val: number = row.getValue("record");
            if (val === 0) return <div className="text-center text-muted-foreground">—</div>;
            return (
                <div
                    className={cn(
                        "text-center font-semibold",
                    )}
                >
                    {val}
                </div>
            );
        },
    },
    {
        accessorKey: "action_label",
        header: () => <div className="text-center w-[180px]">{t("table.action")}</div>,
        cell: ({ row }) => (
            <div className="text-sm text-muted-foreground text-center">{row.getValue("action_label")}</div>
        ),
    },
    {
        accessorKey: "bill_number",
        header: () => <div className="text-center w-[120px]">{t("packaging.history.columns.bill")}</div>,
        cell: ({ row }) => (
            <div className="text-center text-sm">
                {row.getValue("bill_number") ?? "—"}
            </div>
        ),
    },
    {
        accessorKey: "performed_by",
        header: () => <div className="text-center w-[100px]">{t("packaging.history.columns.performed_by")}</div>,
        cell: ({ row }) => (
            <div className="text-sm text-muted-foreground text-center">
                {row.getValue("performed_by") ?? "—"}
            </div>
        ),
    },
];

// ── Composant ─────────────────────────────────────────────────────────────────

interface Props {
    clientId: number;
}

export default function ClientPackagingHistory({ clientId }: Props) {
    const today = moment().format("YYYY-MM-DD");
    const thirtyDaysAgo = moment().subtract(30, "days").format("YYYY-MM-DD");

    const [data, setData] = React.useState<PackagingClientHistoryResponse | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [startDate, setStartDate] = React.useState(thirtyDaysAgo);
    const [endDate, setEndDate] = React.useState(today);
    const [searchText, setSearchText] = React.useState("");
    const [table, setTable] = React.useState<any>(null);
    const { t } = useTranslation("common");

    const [pickedDateRange, setPickedDateRange] = React.useState<DateRange>({
        from: moment().toDate(),
        to: moment().toDate(),
    });

    const fetchHistory = async (range?: DateRange) => {
        const r = range ?? pickedDateRange;
        if (!r?.from || !r?.to) return;
        setLoading(true);
        setError(null);
        try {
            const res = await instance.get("/packaging/client-history/", {
                params: {
                    client_id: clientId,
                    start_date: moment(r.from).format("YYYY-MM-DD"),
                    end_date: moment(r.to).format("YYYY-MM-DD"),
                },
                withCredentials: true,
            });
            setData(res.data);
        } catch (e: any) {
            setError(e.response?.data?.error ?? t("packaging.errors.history_load_failed"));
        } finally {
            setLoading(false);
        }
    };


    const handleDateRangeChange = (range: DateRange) => {
        setPickedDateRange(range);
    };

    React.useEffect(() => { fetchHistory(); }, [clientId]);

    // Rows enrichies avec index pour la colonne #
    const tableData = React.useMemo(
        () => (data?.timeline.reverse() ?? []).map((ev, i) => ({ ...ev, number: i + 1 })),
        [data]
    );

    return (
        <div className="space-y-5">

            {/* Filtres */}
            <div className="gap-3 items-end grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                <DateRangePicker
                    defaultDateRange={pickedDateRange}
                    datesData={datesData}
                    onDateRangeChange={handleDateRangeChange}

                />
                <Button
                    onClick={() => fetchHistory()}
                    disabled={loading}
                    variant="secondary"
                    className="gap-2"
                >
                    {t("search.action")}
                </Button>
            </div>

            {/* Erreur */}
            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Skeleton */}
            {loading && (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            )}

            {/* Tableau principal */}
            {data && !loading && (
                <DataTableDemo
                    columns={getColumns(t)}
                    data={tableData}
                    setTableData={setTable}
                    filterAttributes={["packaging", "product", "bill_number", "action_label"]}
                    searchText={searchText}
                >
                    <div className="flex items-center justify-between py-4">
                        <Input
                            placeholder={t("packaging.history.filter_placeholder")}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="max-w-sm"
                        />
                        {data.event_count > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {t(data.event_count > 1 ? "packaging.history.events_count" : "packaging.history.event_count", { count: data.event_count })}
                            </span>
                        )}
                    </div>
                </DataTableDemo>
            )}

        </div>
    );
}