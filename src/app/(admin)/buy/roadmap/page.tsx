"use client";
import {
AppDispatch,
RootState } from "@/redux/store";
import { fetchSupplies } from "@/redux/supplies";
import React from "react";
import { useDispatch,
useSelector } from "react-redux";
import { generateCSV,
groupBySupplierAndCategory } from "./functions";
import { Backdrop,
CircularProgress } from "@mui/material";
import moment from "moment";
import { Combobox } from "@/components/ComboBox";
import { datesData } from "@/utils/constants";
import { ChevronDown,
CircleAlert,
OctagonX,
XCircle,
Sparkles,
AlertTriangle,
TrendingDown,
PackageSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SelectPopover from "@/components/SelectPopover";
import { fetchProductsCat } from "@/redux/productsCat";
import CardBodyContent from "@/components/CardContent";
import IconButton from "../../sell/roadmap/IconBtn";
import { toast } from "@/components/ui/app-toast";
import { BlobProvider } from "@react-pdf/renderer";
import BuyRoadmap from "@/app/pdf/buyRoadMap";
import ReactDOM from "react-dom/client";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { usePermission } from "@/context/PermissionContext";
import { useTranslation } from "react-i18next";
import { DateRangePicker } from "@/components/DateRangePicker";
import { instance } from "@/components/fetch";
import { PlanGate } from "@/components/PlanGate";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const dispatch: AppDispatch = useDispatch();
  const [pickedDateRange, setPickedDateRange] = React.useState<DateRange>({
    from: new Date().toString(),
    to: new Date().toString(),
  });
  const [organizedData, setOrganizedData] =
    React.useState<OrganizedRoute | null>(null);
  const [selectedSalesPoint, setSelectedSalesPoint] =
    React.useState<SalesPoint | null>(null);
  const { supplies, status, error } = useSelector(
    (state: RootState) => state.supplies
  );
  const { t } = useTranslation("common")

  const [selectedProductsCat, setSelectedProductsCat] = React.useState([]);
  const {
    data: salesPoints,
    status: statusSalesPoints,
    error: errorSalesPoints,
  } = useSelector((state: RootState) => state.salesPoints);
  const {
    data: productsCat,
    status: productsCatStatus,
    error: productsCatError,
  } = useSelector((state: RootState) => state.productsCat);

  const { isAdmin, user } = usePermission()

  // ── Suggestions de réapprovisionnement IA ─────────────────────────────────
  const [reorderSuggestions, setReorderSuggestions] = React.useState<any[]>([]);
  const [reorderLoading, setReorderLoading] = React.useState(false);

  const fetchReorderSuggestions = React.useCallback(async (salesPointId?: number) => {
    setReorderLoading(true);
    const params = salesPointId ? `?sales_point=${salesPointId}` : "";
    try {
      const res = await instance.get(`/ai/reorder-suggestions/${params}`);
      setReorderSuggestions(res.data?.suggestions ?? res.data ?? []);
    } catch {
      setReorderSuggestions([]);
    } finally {
      setReorderLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!isAdmin()) {
      fetchReorderSuggestions(user?.sales_point);
    }
  }, []);
  
  React.useEffect(() => {
    if (status === "idle") {
      dispatch(
        fetchSupplies({
          sales_point: isAdmin() ? selectedSalesPoint ? [selectedSalesPoint.id] : [] : [user?.sales_point],
          start_date: moment(pickedDateRange?.from).format(
            "YYYY-MM-DDT00:00:00.SSS"
          ),
          end_date: moment(pickedDateRange?.to).format(
            "YYYY-MM-DDT23:59:59.SSS"
          ),
        })
      );
    }
    if (productsCatStatus == 'idle' && !isAdmin()) {
      dispatch(fetchProductsCat({ sales_points_id: [user?.sales_point] }))
    }
    if (statusSalesPoints == "idle") {
      dispatch(fetchSalesPoints());
    }
  }, []);

  const getData = async () => {
    if (!selectedSalesPoint && isAdmin()) {
      return toast({
        variant: "destructive",
        icon: <XCircle className="size-4" />,
        title: t("error"),
        description: t("sales_points.select_required"),
      });
    }
    const fetch = await dispatch(
      fetchSupplies({
        sales_point: isAdmin() ? [selectedSalesPoint?.id] : [user?.sales_point],
        start_date: moment(pickedDateRange?.from).format(
          "YYYY-MM-DDT00:00:00.SSS"
        ),
        end_date: moment(pickedDateRange?.to).format("YYYY-MM-DDT23:59:59.SSS"),
      })
    );
    if (fetchSupplies.fulfilled.match(fetch)) {
      const data: Supply[] = fetch.payload;
      if (!data.find((el) => el.status === "receipt")) {
        return toast({
          variant: "destructive",
          title: t("error"),
          description: t("empty.no_data_found"),
          icon: <XCircle className="size-4" />,
        });
      }
      if (data.some((item) => item.status === "pending")) {
        toast({
          variant: "warning",
          title: t("warning"),
          description: t("roadmap.buy.pending_orders_warning"),
          icon: <CircleAlert className="size-4" />,
        });
      }
      const organizedData = groupBySupplierAndCategory(
        data.filter((el) => el.status === "receipt")
      );
      setOrganizedData(organizedData);
    }
  };

  const handleDateRangeChange = (range: DateRange) => {
    setPickedDateRange(range);
  };

  const handleValueChange = (value: SalesPoint | null) => {
    setSelectedSalesPoint(value);
    dispatch(fetchProductsCat({ sales_points_id: value ? [value.id] : [] }));
    setSelectedProductsCat([]);
    if (value?.id) fetchReorderSuggestions(value.id);
  };

  const handleSelect = (data: any) => {
    setSelectedProductsCat((prev: any) =>
      prev.includes(data)
        ? prev.filter((item: any) => item !== data)
        : [...prev, data]
    );
  };

  const handleOpenPDF = () => {
    const newWindow = window.open("", "_blank");
    if (!newWindow) {
      alert(t("popup_blocked"));
      return;
    }
    newWindow.document.write(`<p>${t("loading_pdf")}</p>`);
    const pdfBlobProvider = (
      <BlobProvider
        document={
          <BuyRoadmap
            salespoint={isAdmin() ? selectedSalesPoint : user?.sales_point_details}
            //@ts-ignore
            groupedData={organizedData}
            title={t("roadmap.buy.pdf_title", { from: moment(pickedDateRange?.from).format("L"), range: moment(pickedDateRange?.from).valueOf() == moment(pickedDateRange?.to).valueOf() ? "" : ` ${t("supply.common.to")} ${moment(pickedDateRange?.to).format("L")}` })}
          />
        }
      >
        {/* @ts-ignore */}
        {({ blob }) => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            newWindow.location.href = blobUrl;
          } else {
            newWindow.document.write(`<p>${t("pdf_error")}</p>`);
          }
        }}
      </BlobProvider>
    );

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    root.render(pdfBlobProvider);
  };

  const PDFButton = () => {
    const [isHovered, setIsHovered] = React.useState(false);
    const { t } = useTranslation("common");

    return (
      <Button
        variant="outline"
        className="border-red-500 hover:bg-red-500 hover:text-white space-x-2"
        onClick={handleOpenPDF}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 16 16"
          className="mr-2"
        >
          <path
            fill="none"
            stroke={isHovered ? "#FFF" : "#ed8796"}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.8 14.34c1.81-1.25 3.02-3.16 3.91-5.5c.9-2.33 1.86-4.33 1.44-6.63c-.06-.36-.57-.73-.83-.7c-1.02.06-.95 1.21-.85 1.9c.24 1.71 1.56 3.7 2.84 5.56c1.27 1.87 2.32 2.16 3.78 2.26c.5.03 1.25-.14 1.37-.58c.77-2.8-9.02-.54-12.28 2.08c-.4.33-.86 1-.6 1.46c.2.36.87.4 1.23.15h0Z"
          />
        </svg>

        {t("supply.actions.export_pdf")}
      </Button>
    );
  };

  const handleGenerateCSV = () => {
    generateCSV({
      groupedData: organizedData,
      title: t("roadmap.buy.csv_title", { from: moment(pickedDateRange?.from).format("L"), range: moment(pickedDateRange?.from).valueOf() == moment(pickedDateRange?.to).valueOf() ? "" : ` ${t("supply.common.to")} ${moment(pickedDateRange?.to).format("L")}`, salespoint: isAdmin() ? selectedSalesPoint?.name : user?.sales_point_details.name }),
      salespoint: isAdmin() ? selectedSalesPoint : user?.sales_point_details,
    });
  };

  return (
    <div className="space-y-5">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={
          status === "loading" ||
          statusSalesPoints === "loading" ||
          productsCatStatus === "loading"
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <CardBodyContent className="shadow border select-none p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4">

          <DateRangePicker
            //@ts-ignore
            defaultDateRange={pickedDateRange}
            datesData={datesData}
            onDateRangeChange={(date) => {
              if (date.from && date.to) {
                handleDateRangeChange(date);
              }
            }}
          />

          {isAdmin() && (
            <Combobox
              options={salesPoints}
              RightIcon={ChevronDown}
              onValueChange={handleValueChange}
              getOptionValue={(o) => `${o.name} - ${o.address}`}
              value={selectedSalesPoint}
              buttonLabel={t("supply.labels.sales_points")}
              getOptionLabel={(o) => `${o.name} - ${o.address}`}
              placeholder={t("supply.placeholders.sales_points")}
            />
          )}

          <SelectPopover
            items={productsCat}
            getOptionLabel={(o) => o.name}
            onSelect={handleSelect}
            selectedItems={selectedProductsCat}
            noItemText={t("supply.empty.product_categories")}
            placeholder={t("supply.placeholders.product_categories")}
            searchPlaceholder={t("supply.placeholders.search_category")}
          />

          <Button
            variant="primary"
            onClick={getData}
            disabled={!selectedSalesPoint && isAdmin()}
            className="w-full"
          >
            {t("supply.actions.search")}
          </Button>

        </div>
      </CardBodyContent>

      <CardBodyContent>
        {organizedData ? (
          <>
            <h4 className="text-center">
              {t("titles.sales_report_of")}{" "}
              {moment(pickedDateRange?.from).valueOf() ===
                moment(pickedDateRange?.to).valueOf()
                ? moment(pickedDateRange?.from).format("DD/MM/YYYY")
                : `${moment(pickedDateRange?.from).format("L")} ${t(
                  "supply.common.to"
                )} ${moment(pickedDateRange?.to).format("L")}`}
            </h4>

            <div className="flex mt-3 items-center justify-center space-x-3">
              <PDFButton />

              <IconButton
                text={t("supply.actions.export_csv")}
                onClick={handleGenerateCSV}
                icon={
                  "M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2"
                }
                buttonClass="border-green-500 hover:bg-green-500 hover:text-white"
                hoverColor="#FFF"
                defaultColor="#15803d"
              />
            </div>
          </>
        ) : (
          <h4 className="text-center">
            {t("supply.empty.no_data_generated")}
          </h4>
        )}
      </CardBodyContent>

      {/* ── Suggestions de réapprovisionnement IA (plan Pro) ── */}
      {/* <PlanGate minPlan="pro" fallback="null">
        <CardBodyContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-medium">{t("reorder.suggestions_title")}</h4>
            <span className="ml-auto text-xs text-muted-foreground">{t("reorder.ia_powered")}</span>
          </div>

          {reorderLoading && (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          )}

          {!reorderLoading && reorderSuggestions.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <PackageSearch className="w-8 h-8" />
              <p className="text-sm">{t("reorder.no_suggestions")}</p>
            </div>
          )}

          {!reorderLoading && reorderSuggestions.length > 0 && (
            <div className="space-y-2">
              {reorderSuggestions.map((s: any, i: number) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-4 py-3",
                    s.urgency === "critical"
                      ? "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20"
                      : s.urgency === "low"
                      ? "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20"
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {s.urgency === "critical"
                      ? <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      : <TrendingDown className="w-4 h-4 text-amber-500 shrink-0" />
                    }
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.product_name ?? s.product}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("reorder.stock_current")} : {s.current_stock} · {t("reorder.suggested_qty")} : {s.suggested_quantity}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium border",
                    s.urgency === "critical"
                      ? "bg-red-100 text-red-700 border-red-200"
                      : "bg-amber-100 text-amber-700 border-amber-200"
                  )}>
                    {s.urgency === "critical" ? t("reorder.urgency_critical") : t("reorder.urgency_low")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardBodyContent>
      </PlanGate> */}
    </div>
  );
}
