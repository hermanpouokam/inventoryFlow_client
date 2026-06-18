"use client";
import CardBodyContent from "@/components/CardContent";
import {
Combobox } from "@/components/ComboBox";
import { DateRangePicker } from "@/components/DateRangePicker";
import SelectPopover from "@/components/SelectPopover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
import { toast } from "@/components/ui/app-toast";
import { BlobProvider } from "@react-pdf/renderer";
import ReactDOM from "react-dom/client";
import InventoryPDF from "@/app/pdf/inventorPDF";
import {
  deleteInventoryPackage,
  validateInventoryPackage,
} from "../../inventory/functions";
import { fetchPackagingInventory } from "@/redux/packagingInventory";
import { usePermission } from "@/context/PermissionContext";
import InventoryPackagingPDF from "@/app/pdf/inventoryPackagingPdf";
import { useTranslation } from "react-i18next";

export default function Page() {
  const { t: tCommon } = useTranslation("common");
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
  const [status, setStatus] = React.useState<{
    name: string;
    value: boolean | null;
  } | null>({
    name: tCommon("status_filter.all"),
    value: null,
  });
  const { data: salespoints, status: salespointStatus } = useSelector(
    (state: RootState) => state.salesPoints
  );
  const [table, setTable] = React.useState<any | null>(null);

  const { user, hasPermission, isAdmin } = usePermission()

  const { packagingInventory, status: statusInventoriesPackaging } =
    useSelector((state: RootState) => state.packagingInventories);
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
      sales_point: selectedSalesPoints.map((s) => s.id),
      ...(status?.value != null ? { is_validated: status.value } : {}),
    };
    dispatch(fetchPackagingInventory(params));
    setLoading(false);
  };

  React.useEffect(() => {
    getData();
    if (salespointStatus == "idle") {
      dispatch(fetchSalesPoints());
    }
  }, []);

  const columns: ColumnDef<InventoryPackage>[] = [
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
            {tCommon("inventory.columns.inventory_number")}
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="capitalize text-center">{row.original.inventory_number}</div>
        );
      },
    },
    ...(isAdmin() ? [{
      accessorKey: "sales_point",
      header: () => <div className="text-center w-[140px]">{tCommon("sales_points.singular")}</div>,
      cell: ({ row }: { row: Row<InventoryPackage> }) => {
        return (
          <div className="text-center font-medium">
            {row.original.sales_point_details.name}
          </div>
        );
      },
    }] : []),
    {
      accessorKey: "operateur",
      header: () => <div className="text-center w-[140px]">{tCommon("inventory.columns.operator")}</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {row.original.created_by_full_name}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center w-[140px]">{tCommon("billing.status")}</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            <p>
              <span
                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${row.original.is_validated ? "green" : "red"
                  }-500 text-${row.original.is_validated ? "white" : "black"}`}
              >
                {row.original.is_validated ? tCommon("status_filter.validated") : tCommon("status_filter.not_validated")}
              </span>
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "valide",
      header: () => <div className="text-center w-[140px]">{tCommon("inventory.columns.validated_by")}</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {row.original.validated_by_full_name ?? "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "packaging_count",
      header: () => (
        <div className="text-center w-[160px]">{tCommon("packaging_inventory.columns.packaging_count")}</div>
      ),
      cell: ({ row }) => {
        const variant = row.original;
        return (
          <div className="text-center font-medium">
            {row.original.items.length}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: () => (
        <div className="text-right w-[140px]">{tCommon("inventory.columns.created_at")}</div>
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
        <div className="text-right w-[140px]">{tCommon("inventory.columns.validated_at")}</div>
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
      header: () => <div className="text-right w-[30px]">{tCommon("table.action")}</div>,
      cell: ({ row }) => {
        const handleValidateInventory = async () => {
          setLoading(true);
          try {
            const res = await validateInventoryPackage(row.original.id);
            if (res.data.message) {
              await getData();
              return toast({
                title: tCommon("success"),
                variant: "success",
                description:
                  res.data.message ?? tCommon("packaging_inventory.success.validated"),
                icon: <CheckCircle className="size-4" />,
              });
            }
          } catch (error) {
            toast({
              title: tCommon("error"),
              description: `${error.response.data.error ??
                tCommon("packaging_inventory.errors.validate")
                }`,
              icon: <XCircle className="size-4" />,
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        };

        const handleDeleteInventory = async () => {
          setLoading(true);
          try {
            const res = await deleteInventoryPackage(row.original.id);
            if (res.data.success) {
              await getData();
              return toast({
                title: tCommon("success"),
                variant: "success",
                description: res.data.success,
                icon: <CheckCircle className="size-4" />,
              });
            }
          } catch (error) {
            toast({
              title: tCommon("error"),
              variant: "destructive",
              description: `${error.response.data.error ??
                tCommon("packaging_inventory.errors.delete")
                }`,
              icon: <XCircle className="size-4" />,
            });
          } finally {
            setLoading(false);
          }
        };

        const handleOpenPDF = () => {
          const newWindow = window.open("", "_blank");
          if (!newWindow) {
            alert(tCommon("popup_blocked"));
            return;
          }
          newWindow.document.write(`<p>${tCommon("loading_pdf")}</p>`);
          const pdfBlobProvider = (
            <BlobProvider
              document={
                <InventoryPackagingPDF
                  title={tCommon("packaging_inventory.pdf_title", { date: new Date(row.original.created_at).toLocaleDateString() })}
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
                  newWindow.document.write(`<p>${tCommon("pdf_error")}</p>`);
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
                <span className="sr-only">{tCommon("open_menu")}</span>
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!row.original.is_validated && !hasPermission('validate_packaging_inventory') && (
                <DropdownMenuItem
                  disabled={row.original.is_validated}
                  onClick={handleValidateInventory}
                >
                  <ArrowDown size={14} className="mr-3 w-4 h-4" />
                  {tCommon("inventory.actions.validate")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleOpenPDF}>
                {" "}
                <Printer className="mr-3 w-4 h-4" size={14} />
                {tCommon("inventory.actions.print")}
              </DropdownMenuItem>
              {!row.original.is_validated && hasPermission('validate_packaging_inventory') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-500 hover:text-red-500"
                    onClick={handleDeleteInventory}
                  >
                    {" "}
                    <Trash className="mr-3 w-4 h-4" size={14} />
                    {tCommon("inventory.actions.delete")}
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
          statusInventoriesPackaging == "loading" ||
          loading
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardBodyContent>
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold">{tCommon("packaging_inventory.title")}</h3>
          {
            hasPermission('add_packaging_inventory') ?
              <Button
                onClick={() =>
                  window.location.assign("/stock/packagings/inventory/new/")
                }
                // className="bg-indigo-600 hover:bg-indigo-700"
                variant={'secondary'}
              >
                {tCommon("inventory.actions.new")}
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
          {isAdmin() ?
            <SelectPopover
              selectedItems={selectedSalesPoints}
              items={salespoints}
              getOptionLabel={(option) => `${option.name} - ${option.address}`}
              onSelect={handleSelect}
              placeholder={tCommon("sales_points.label")}
            />
            : null}
          <Combobox
            options={[
              { name: tCommon("status_filter.all"), value: null },
              { name: tCommon("status_filter.validated"), value: true },
              { name: tCommon("status_filter.not_validated"), value: false },
            ]}
            getOptionLabel={(option) => `${option.name}`}
            getOptionValue={(option) => `${option.name}`}
            placeholder={tCommon("billing.status")}
            RightIcon={ChevronDown}
            buttonLabel={tCommon("billing.status")}
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
            {tCommon("search.action")}
          </Button>
        </div>
      </CardBodyContent>
      <CardBodyContent>
        <h3>{tCommon("inventory.list_title")}</h3>
        <DataTableDemo
          setTableData={setTable}
          columns={columns}
          searchText=""
          filterAttributes={["inventory_number"]}
          data={[...packagingInventory]
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
            <div className="flex gap-3 items-center flex-col sm:flex-row">
              <Input
                placeholder={tCommon("inventory.filter_placeholder")}
                value={
                  table
                    ?.getColumn("name")
                    ?.getFilterValue() as string
                }
                onChange={(event) =>
                  table
                    ?.getColumn("name")
                    ?.setFilterValue(event.target.value)
                }
                className="md"
              />
            </div>
          </div>
        </DataTableDemo>
      </CardBodyContent>
    </div>
  );
}
