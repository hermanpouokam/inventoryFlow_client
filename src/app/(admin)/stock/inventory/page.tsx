"use client";
import CardBodyContent from "@/components/CardContent";
import {
Combobox } from "@/components/ComboBox";
import { DateRangePicker } from "@/components/DateRangePicker";
import SelectPopover from "@/components/SelectPopover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchInventories } from "@/redux/inventory";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { AppDispatch,
RootState } from "@/redux/store";
import { datesData } from "@/utils/constants";
import {
  ArrowDown,
Check,
ChevronDown,
EllipsisVertical,
Printer,
Trash,
X,
CheckCircle,
XCircle,
} from "lucide-react";
import moment from "moment";
import * as React from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { ColumnDef, Row } from "@tanstack/react-table";
import { DataTableDemo } from "@/components/TableComponent";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Backdrop, CircularProgress } from "@mui/material";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { validateInventory, deleteInventory } from "./functions";
import { toast } from "@/components/ui/app-toast";
import { BlobProvider } from "@react-pdf/renderer";
import ReactDOM from "react-dom/client";
import InventoryPDF from "@/app/pdf/inventorPDF";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePermission } from "@/context/PermissionContext";
import { useTranslation } from "react-i18next";

export default function Page() {
  const { t } = useTranslation("common");
  const [pickedDateRange, setPickedDateRange] = React.useState<DateRange>({
    from: new Date().toString(),
    to: new Date().toString(),
  });
  const [loading, setLoading] = React.useState(false);
  const handleDateRangeChange = (range: DateRange) => {
    setPickedDateRange(range);
  };
  const dispatch: AppDispatch = useDispatch();
  const [selectedSalesPoints, setSelectedSalesPoints] = React.useState<
    SalesPoint[]
  >([]);
  const [text, setText] = React.useState("");
  const [status, setStatus] = React.useState<{
    name: string;
    value: boolean | null;
  } | null>({
    name: t("status_filter.all"),
    value: null,
  });
  const { data: salespoints, status: salespointStatus } = useSelector(
    (state: RootState) => state.salesPoints
  );
  const [table, setTable] = React.useState<any | null>(null);

  const { inventories, status: statusInventories } = useSelector(
    (state: RootState) => state.inventories
  );
  const [dialogFor, setDialogFor] = React.useState<null | string>(null);
  const [inventory, setInventory] = React.useState<null | Inventory>(null);
  const { isAdmin, hasPermission, user } = usePermission()
  const handleSelect = (data: SalesPoint) => {
    setSelectedSalesPoints((prev) =>
      prev.includes(data)
        ? prev.filter((item) => item !== data)
        : [...prev, data]
    );
  };

  const getData = async () => {
    setLoading(true);

    const params = {
      start_date: moment(pickedDateRange?.from).format(
        "YYYY-MM-DDT00:00:00.SSS"
      ),
      end_date: moment(pickedDateRange?.to).format("YYYY-MM-DDT23:59:59.SSS"),
      sales_point: isAdmin() ? selectedSalesPoints.map((s) => s.id) : [user?.sales_point],
      ...(status != null ? { is_validated: status.value } : {}),
    };
    dispatch(fetchInventories(params));
    setLoading(false);
  };

  React.useEffect(() => {
    getData();
    if (salespointStatus == "idle" && isAdmin()) {
      dispatch(fetchSalesPoints());
    }
  }, []);

  const handleValidateInventory = async () => {
    setLoading(true);
    try {
      const res = await validateInventory(inventory.id);
      if (res.data.success) {
        await getData();
        return toast({
          title: t("success"),
          variant: "success",
          description: res.data.success,
          icon: <CheckCircle className="size-4" />,
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: `${error.response.data.error ??
          t("inventory.errors.validate")
          }`,
        icon: <XCircle className="size-4" />,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setDialogFor(null);
      setInventory(null);
    }
  };

  const handleDeleteInventory = async () => {
    setLoading(true);
    try {
      const res = await deleteInventory(inventory?.id);
      if (res.data.success) {
        await getData();
        return toast({
          title: t("success"),
          variant: "success",
          description: res.data.success,
          icon: <CheckCircle className="size-4" />,
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        variant: "destructive",
        description: `${error.response.data.error ??
          t("inventory.errors.delete")
          }`,
        icon: <XCircle className="size-4" />,
      });
    } finally {
      setLoading(false);
      setDialogFor(null);
      setInventory(null);
    }
  };

  const columns: ColumnDef<Inventory>[] = [
    {
      accessorKey: "number",
      header: () => <div className="w-5">#</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("number")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div
            className="text-center w-[180px]"
          // onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("inventory.columns.inventory_number")}
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="capitalize">{row.original.inventory_number}</div>
        );
      },
    }, ...(isAdmin() ? [
      {
        accessorKey: "sales_point",
        header: () => <div className="text-center w-[140px]">{t("sales_points.singular")}</div>,
        cell: ({ row }: { row: Row<Inventory> }) => {
          return (
            <div className="text-center font-medium">
              {row.original.sales_point_details.name}
            </div>
          );
        },
      }] : []),
    {
      accessorKey: "operateur",
      header: () => <div className="text-center w-[140px]">{t("inventory.columns.operator")}</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {row.original.created_by_name}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center w-[140px]">{t("billing.status")}</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            <p>
              <span
                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${row.original.is_validated ? "green" : "red"
                  }-500 text-${row.original.is_validated ? "white" : "black"}`}
              >
                {row.original.is_validated ? t("status_filter.validated") : t("status_filter.not_validated")}
              </span>
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "valide",
      header: () => <div className="text-center w-[140px]">{t("inventory.columns.validated_by")}</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {row.original.validated_by_name ?? "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "product_count",
      header: () => (
        <div className="text-center w-[140px]">{t("inventory.columns.product_count")}</div>
      ),
      cell: ({ row }) => {
        const variant = row.original;
        return (
          <div className="text-center font-medium">
            {row.original.inventory_products.length}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: () => (
        <div className="text-right w-[140px]">{t("inventory.columns.created_at")}</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">
            {new Date(row.original.created_at).toLocaleString()}
          </div>
        );
      },
    },
    {
      accessorKey: "validated_at",
      header: () => (
        <div className="text-right w-[140px]">{t("inventory.columns.validated_at")}</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {row.original.validated_at
              ? new Date(row.original.validated_at).toLocaleString()
              : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      enableHiding: false,
      header: () => <div className="text-right w-[30px]">{t("table.action")}</div>,
      cell: ({ row }) => {
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
                <InventoryPDF
                  title={t("inventory.pdf_title", { date: new Date(row.original.created_at).toLocaleDateString() })}
                  inventory={row.original}
                />
              }
            >
              {/* @ts-ignore */}
              {({ blob }) => {
                if (blob) {
                  const blobUrl = URL.createObjectURL(blob);
                  newWindow.location.href = blobUrl; // Redirect the popup to the blob URL
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

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t("open_menu")}</span>
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!row.original.is_validated && hasPermission('validate_inventory') && (
                <DropdownMenuItem
                  disabled={row.original.is_validated}
                  onClick={() => {
                    setDialogFor("validate");
                    setInventory(row.original);
                  }}
                >
                  <ArrowDown size={14} className="mr-3 w-4 h-4" />
                  {t("inventory.actions.validate")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleOpenPDF}>
                {" "}
                <Printer className="mr-3 w-4 h-4" size={14} />
                {t("inventory.actions.print")}
              </DropdownMenuItem>
              {!row.original.is_validated && hasPermission('delete_inventory') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-500 hover:text-red-500"
                    onClick={() => {
                      setDialogFor("delete");
                      setInventory(row.original);
                    }}
                  >
                    {" "}
                    <Trash className="mr-3 w-4 h-4" size={14} />
                    {t("inventory.actions.delete")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={
          salespointStatus == "loading" ||
          statusInventories == "loading" ||
          loading
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardBodyContent>
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold">{t("inventory.title")}</h3>
          {hasPermission('add_inventory') ?
            <Button
              onClick={() => window.location.assign("/stock/inventory/new")}
              variant={"secondary"}
            >
              {t("inventory.actions.new")}
            </Button>
            : null}
        </div>
      </CardBodyContent>
      <CardBodyContent className="shadow border select-none p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <DateRangePicker
            defaultDateRange={pickedDateRange}
            datesData={datesData}
            onDateRangeChange={(date) => {
              if (date.from && date.to) {
                handleDateRangeChange(date);
              }
            }}
          />
          {
            isAdmin() ?
              <SelectPopover
                selectedItems={selectedSalesPoints}
                items={salespoints}
                getOptionLabel={(option) => `${option.name} - ${option.address}`}
                onSelect={handleSelect}
                placeholder={t("sales_points.label")}
              />
              : null}
          <Combobox
            options={[
              { name: t("status_filter.all"), value: null },
              { name: t("status_filter.validated"), value: true },
              { name: t("status_filter.not_validated"), value: false },
            ]}
            getOptionLabel={(option) => `${option.name}`}
            getOptionValue={(option) => `${option.name}`}
            placeholder={t("billing.status")}
            RightIcon={ChevronDown}
            buttonLabel={t("billing.status")}
            onValueChange={(el) => setStatus(el)}
            value={status}
          />
          <Button
            variant={"primary"}
            onClick={getData}
            className={cn(
              "w-full "
            )}
          >
            {t("search.action")}
          </Button>
        </div>
      </CardBodyContent>
      <CardBodyContent>
        <h3>{t("inventory.list_title")}</h3>
        <DataTableDemo
          setTableData={setTable}
          columns={columns}
          searchText={text}
          filterAttributes={["inventory_number"]}
          data={[...inventories]
            ?.sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            )
            .map((el, index) => {
              return { ...el, number: index + 1 };
            })}
        >
          <div className="flex items-center flex-col sm:flex-row space-y-3 justify-between py-4">
            <div className="flex gap-3 items-center flex-col sm:flex-row w-sm">
              <Input
                placeholder={t("inventory.filter_placeholder")}
                value={text}
                onChange={(event) => setText(event.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </DataTableDemo>
      </CardBodyContent>
      <Dialog
        open={dialogFor ? true : false}
        onOpenChange={() => setDialogFor(null)}
      >
        {dialogFor == "delete" ? (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-500">
                {t("inventory.dialogs.confirm_delete", { number: inventory?.inventory_number })}
              </DialogTitle>
              <DialogDescription>
                {t("inventory.dialogs.delete_description")}
                <p className="text-red-500">
                  {t("dialogs.irreversible_warning")}
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogFor(null)}>
                {t("cancel")}
              </Button>
              <Button
                variant={"default"}
                className="bg-green-500 hover:bg-green-600 transition"
                onClick={handleDeleteInventory}
                disabled={loading}
              >
                {loading ? t("please wait") : t("delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("inventory.dialogs.confirm_validate", { number: inventory?.inventory_number })}</DialogTitle>
              <DialogDescription>
                {t("inventory.dialogs.validate_description")}
                <p className="text-red-600">
                  {t("dialogs.irreversible_warning")}
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogFor(null)}>
                {t("cancel")}
              </Button>
              <Button
                variant={"default"}
                className="bg-green-500 hover:bg-green-600 transition"
                onClick={handleValidateInventory}
                disabled={loading}
              >
                {loading ? t("please wait") : t("validate")}
              </Button>{" "}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
