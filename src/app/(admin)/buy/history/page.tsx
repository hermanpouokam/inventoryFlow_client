//@ts-nocheck
"use client";

import SelectPopover from "@/components/SelectPopover";
import { DataTableDemo } from "@/components/TableComponent";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AppDispatch, RootState } from "@/redux/store";
import { datesData } from "@/utils/constants";
import { Backdrop, CircularProgress } from "@mui/material";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import moment from "moment";
import { getBill, getSupplies } from "../../sell/functions";
import { formatteCurrency } from "../../stock/functions";
import { ActionComponent } from "../in_progress/ActionComponent";
import { fetchSuppliers } from "@/redux/suppliersSlicer";
import { usePermission } from "@/context/PermissionContext";
import CardBodyContent from "@/components/CardContent";
import { DateRangePicker } from "@/components/DateRangePicker";
import { useTranslation } from "react-i18next";

function Page() {
  const [pickedDateRange, setPickedDateRange] = React.useState<DateRange>({
    from: new Date().toString(),
    to: new Date().toString(),
  });

  const [table, setTable] = React.useState<any | null>(null);
  const [data, setData] = React.useState<Supply[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [text, setText] = React.useState("")
  const [selectedSalesPoints, setSelectedSalesPoints] = React.useState<
    SalesPoint[]
  >([]);
  const [selectedSuppliers, setSelectedSuppliers] = React.useState<Supplier[]>(
    []
  );
  const { t } = useTranslation("common");

  const dispatch: AppDispatch = useDispatch();

  const { data: salespoints, status: salespointStatus } = useSelector(
    (state: RootState) => state.salesPoints
  );

  const { data: suppliers, status: suppliersStatus } = useSelector(
    (state: RootState) => state.suppliers
  );

  const handleDateRangeChange = (range: DateRange) => {
    setPickedDateRange(range);
  };

  const { hasPermission, isAdmin, user } = usePermission()

  const columns: ColumnDef<Supply>[] = [
    {
      accessorKey: "number",
      header: () => (
        <div className="w-[20px]">
          {t("bills.columns.number")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="lowercase">
          {row.getValue("number")}
        </div>
      ),
    },

    {
      id: "actions",
      enableHiding: false,
      header: () => (
        <div className="text-left w-[50px]">
          {t("bills.columns.actions")}
        </div>
      ),
      cell: ({ row }) => (
        <ActionComponent
          supply={row.original}
          onGetData={getData}
          onSetLoading={(el) => setLoading(el)}
          loading={loading}
          page="history"
        />
      ),
    },

    {
      accessorKey: "supply_number",
      header: () => (
        <div className="text-center w-[140px]">
          {t("bills.columns.supply_number")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="capitalize">
          {row.original.supply_number}
        </div>
      ),
    },

    ...(isAdmin()
      ? [
        {
          accessorKey: "sales_point",
          header: () => (
            <div className="text-center w-[220px]">
              {t("bills.columns.sales_point")}
            </div>
          ),
          cell: ({ row }: { row: Row<Supply> }) => (
            <div className="text-center capitalize truncate">
              {row.original.sales_point_details.name} -{" "}
              {row.original.sales_point_details.address}
            </div>
          ),
        },
      ]
      : []),

    {
      id: "operator",
      header: () => (
        <div className="text-center w-[220px]">
          {t("bills.columns.operator")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="capitalize text-center text-base font-medium">
          {row.original.operator_details?.name}{" "}
          {row.original.operator_details?.surname}
        </div>
      ),
    },

    {
      id: "packages_count",
      header: () => (
        <div className="flex justify-center w-[110px]">
          {t("bills.columns.packages_count")}
        </div>
      ),
      cell: ({ row }) => {
        const supply_products = row.original.supply_products;

        return (
          <div className="text-center w-[100px]">
            {supply_products.reduce(
              (acc, curr) => acc + curr.quantity,
              0
            )}
          </div>
        );
      },
      footer: () => {
        const totalQty = data.reduce((total, supply) => {
          return (
            total +
            supply.supply_products.reduce(
              (subtotal, sp) => subtotal + sp.quantity,
              0
            )
          );
        }, 0);

        return <div className="text-center">{totalQty}</div>;
      },
    },

    {
      id: "amount",
      header: () => (
        <div className="text-center w-[220px]">
          {t("bills.columns.amount")}
        </div>
      ),
      cell: ({ row }) => {
        const total = row.original.supply_products.reduce(
          (acc, curr) => acc + Number(curr.price) * curr.quantity,
          0
        );

        return (
          <div className="text-center font-medium">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "XAF",
            }).format(total)}
          </div>
        );
      },
      footer: () => {
        const totalAmount = data.reduce((total, supply) => {
          return (
            total +
            supply.supply_products.reduce(
              (subtotal, sp) =>
                subtotal + Number(sp.price) * sp.quantity,
              0
            )
          );
        }, 0);

        return (
          <div className="text-center">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "XAF",
            }).format(totalAmount)}
          </div>
        );
      },
    },

    {
      id: "taxes",
      header: () => (
        <div className="text-center w-[220px]">
          {t("bills.columns.taxes")}
        </div>
      ),
      cell: ({ row }) => {
        const taxes =
          row.original.invoice_history?.[0]?.tax_details;

        return (
          <div className="text-center font-medium">
            {formatteCurrency(
              taxes?.total_tax_amount ?? 0,
              "XAF",
              "fr-FR"
            )}
          </div>
        );
      },
      footer: () => <div className="text-center">-</div>,
    },

    {
      id: "fees",
      header: () => (
        <div className="text-center w-[220px]">
          {t("bills.columns.fees")}
        </div>
      ),
      cell: ({ row }) => {
        const fee =
          row.original.invoice_history?.[0]?.fee_details;

        return (
          <div className="text-center font-medium">
            {formatteCurrency(
              fee?.total_fee_amount ?? 0,
              "XAF",
              "fr-FR"
            )}
          </div>
        );
      },
      footer: () => <div className="text-center">-</div>,
    },

    {
      id: "total",
      header: () => (
        <div className="text-center w-[220px]">
          {t("bills.columns.total")}
        </div>
      ),
      cell: ({ row }) => {
        const sup = row.original;

        return (
          <div className="text-center font-medium">
            {formatteCurrency(
              sup.total_cost +
              Number(
                sup.invoice_history?.[0]?.tax_details
                  ?.total_tax_amount ?? 0
              ) +
              Number(
                sup.invoice_history?.[0]?.fee_details
                  ?.total_fee_amount ?? 0
              ),
              "XAF",
              "fr-FR"
            )}
          </div>
        );
      },
      footer: () => {
        const total = data.reduce((acc, curr) => {
          return (
            acc +
            curr.total_cost +
            Number(
              curr.invoice_history?.[0]?.tax_details
                ?.total_tax_amount ?? 0
            ) +
            Number(
              curr.invoice_history?.[0]?.fee_details
                ?.total_fee_amount ?? 0
            )
          );
        }, 0);

        return (
          <div className="text-center">
            {formatteCurrency(total, "XAF", "fr-FR")}
          </div>
        );
      },
    },

    {
      id: "status",
      header: () => (
        <div className="text-center w-[240px]">
          {t("bills.columns.status")}
        </div>
      ),
      cell: ({ row }) => {
        const status = row.original.status;

        return (
          <div className="text-center font-medium">
            <span
              className={cn(
                "p-2 rounded",
                status === "pending"
                  ? "bg-red-500"
                  : "bg-green-500"
              )}
            >
              {t(`supply_status.${status}`)}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: "created_at",
      header: () => (
        <div className="text-center w-[240px]">
          {t("bills.columns.created_at")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {moment(row.original.created_at).format(
            "DD/MM/YYYY HH:mm:ss"
          )}
        </div>
      ),
    },

    {
      accessorKey: "received_at",
      header: () => (
        <div className="text-center w-[240px]">
          {t("bills.columns.received_at")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.original.received_at
            ? moment(row.original.received_at).format(
              "DD/MM/YYYY HH:mm:ss"
            )
            : "-"}
        </div>
      ),
    },
  ];

  const handleSelect = (data: SalesPoint) => {
    setSelectedSalesPoints((prev) =>
      prev.includes(data)
        ? prev.filter((item) => item !== data)
        : [...prev, data]
    );
    dispatch(
      fetchSuppliers({
        sales_points_id: [...selectedSalesPoints, data].map((el) => el.id),
      })
    );
    setSelectedSuppliers([]);
  };

  const handleSelectSupplier = (data: Supplier) => {
    setSelectedSuppliers((prev) =>
      prev.includes(data)
        ? prev.filter((item) => item !== data)
        : [...prev, data]
    );
  };

  const getData = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: moment(pickedDateRange?.from).format(
          "YYYY-MM-DDT00:00:00.SSS"
        ),
        end_date: moment(pickedDateRange?.to).format("YYYY-MM-DDT23:59:59.SSS"),
        sales_point: isAdmin() ? selectedSalesPoints : [user?.sales_point_details],
        suppliers: selectedSuppliers,
      };
      const res: Supply[] = await getSupplies(params);
      setData(res);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    getData();
    if (!isAdmin() && suppliersStatus === 'idle') {
      dispatch(fetchSuppliers({ sales_points_id: [user?.sales_point] }))
    }
  }, []);

  return (
    <div className="space-y-5">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={
          salespointStatus == "loading" ||
          suppliersStatus == "loading" ||
          loading
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* FILTERS */}
      <CardBodyContent className="shadow border select-none">
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

          {isAdmin() && (
            <SelectPopover
              selectedItems={selectedSalesPoints}
              items={salespoints}
              getOptionLabel={(option) =>
                `${option.name} - ${option.address}`
              }
              onSelect={handleSelect}
              placeholder={t("supply.filters.sales_points")}
            />
          )}

          <SelectPopover
            selectedItems={selectedSuppliers}
            items={suppliers}
            getOptionLabel={(option) =>
              `${option.name} ${isAdmin() ? "-" + option.sales_point_details.name : ""
              }`
            }
            onSelect={handleSelectSupplier}
            placeholder={t("supply.filters.suppliers")}
            noItemText={t("supply.table.no_supplier")}
            searchPlaceholder={t("supply.table.search_supplier")}
          />

          <Button
            variant={"primary"}
            onClick={getData}
            className={cn(
              "w-full"
            )}
          >
            {t("search.action")}
          </Button>
        </div>
      </CardBodyContent>

      {/* TABLE */}
      <CardBodyContent className="space-y-3 shadow select-none p-5">
        <h3 className="font-medium">
          {t("supply.table.title")}
        </h3>

        <DataTableDemo
          setTableData={setTable}
          columns={columns}
          filterAttributes={['supply_number']}
          searchText={text}
          data={data
            .map((el, index) => ({
              ...el,
              number: index + 1,
            }))
            .sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            )}
        >
          <div className="flex items-center justify-between py-4">
            <Input
              placeholder={t("supply.table.filter_placeholder")}
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="max-w-xs"
            />
          </div>
        </DataTableDemo>
      </CardBodyContent>
    </div>
  );
}

export default Page;
