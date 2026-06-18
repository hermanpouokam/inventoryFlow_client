"use client";

import SelectPopover from "@/components/SelectPopover";
import { DataTableDemo } from "@/components/TableComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AppDispatch, RootState } from "@/redux/store";
import { datesData } from "@/utils/constants";
import { Backdrop, CircularProgress } from "@mui/material";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { ActionComponent } from "./ActionComponent";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import moment from "moment";
import { getBill, getSupplies } from "../../sell/functions";
import { formatteCurrency } from "../../stock/functions";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { usePermission } from "@/context/PermissionContext";
import { useTranslation } from "react-i18next";
import CardBodyContent from "@/components/CardContent";
import { DateRangePicker } from "@/components/DateRangePicker";
import { formatDate } from "@/utils/formatDate";

function Page() {
  const [pickedDateRange, setPickedDateRange] = React.useState<DateRange>({
    from: new Date().toString(),
    to: new Date().toString(),
  });

  const [table, setTable] = React.useState<any | null>(null);
  const [data, setData] = React.useState<Supply[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { t: tCommon } = useTranslation('common');
  const [text, setText] = React.useState("")

  const [selectedSalesPoints, setSelectedSalesPoints] = React.useState<
    SalesPoint[]
  >([]);
  const [selectedSuppliers, setSelectedSuppliers] = React.useState<Supplier[]>(
    []
  );

  const dispatch: AppDispatch = useDispatch();

  const { data: salespoints, status: salespointStatus } = useSelector(
    (state: RootState) => state.salesPoints
  );

  const { user, hasPermission, isAdmin } = usePermission()

  const handleDateRangeChange = (range: DateRange) => {
    setPickedDateRange(range);
  };

  const getInvoice = (supply: Supply) =>
    supply.invoice_history?.[0] ?? null;

  const getTaxes = (supply: Supply) =>
    getInvoice(supply)?.tax_details?.total_tax_amount ?? 0;

  const getFees = (supply: Supply) =>
    getInvoice(supply)?.fee_details?.total_fee_amount ?? 0;

  const columns: ColumnDef<Supply>[] = [
    {
      accessorKey: "number",
      header: () => <div className="w-[30px] text-center">{tCommon("bills.columns.number")}</div>,
      cell: ({ row }) => (
        <div className="w-[30px] text-center lowercase">
          {row.getValue("number")}
        </div>
      ),
    },

    {
      id: "actions",
      enableHiding: false,
      header: () => (
        <div className="w-[50px]">{tCommon("bills.columns.actions")}</div>
      ),
      cell: ({ row }) => (
        <ActionComponent
          page="in_progress"
          supply={row.original}
          onGetData={getData}
          onSetLoading={setLoading}
          loading={loading}
        />
      ),
    },

    {
      accessorKey: "supply_number",
      header: () => (
        <div className="text-center w-[140px]">
          {tCommon("bills.columns.supply_number")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
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
              {tCommon("bills.columns.sales_point")}
            </div>
          ),
          cell: ({ row }: { row: Row<Supply> }) => (
            <div className="text-center truncate">
              {row.original.sales_point_details.name} -{" "}
              {row.original.sales_point_details.address}
            </div>
          ),
        },
      ]
      : []),

    {
      accessorKey: "operator",
      header: ({ column }) => (
        <div className="text-center w-[220px]">
          {tCommon("bills.columns.operator")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.original.operator_details?.name}{" "}
          {row.original.operator_details?.surname}
        </div>
      ),
    },

    {
      accessorKey: "quantity",
      header: () => (
        <div className="text-center w-[110px]">
          {tCommon("bills.columns.quantity")}
        </div>
      ),
      cell: ({ row }) => {
        const total = row.original.supply_products.reduce(
          (acc, curr) => acc + curr.quantity,
          0
        );

        return <div className="text-center">{total}</div>;
      },
      footer: () => {
        const total = data.reduce(
          (acc, s) =>
            acc +
            s.supply_products.reduce((a, b) => a + b.quantity, 0),
          0
        );

        return <div className="text-center">{total}</div>;
      },
    },

    {
      accessorKey: "amount",
      header: () => (
        <div className="text-center w-[220px]">
          {tCommon("bills.columns.amount")}
        </div>
      ),
      cell: ({ row }) => {
        const total = row.original.supply_products.reduce(
          (acc, curr) => acc + Number(curr.price) * curr.quantity,
          0
        );

        return (
          <div className="text-center font-medium">
            {formatteCurrency(total)}
          </div>
        );
      },
      footer: () => {
        const total = data.reduce((acc, s) => {
          return (
            acc +
            s.supply_products.reduce(
              (a, b) => a + Number(b.price) * b.quantity,
              0
            )
          );
        }, 0);

        return <div className="text-center">{formatteCurrency(total)}</div>;
      },
    },

    {
      accessorKey: "taxes",
      header: () => (
        <div className="text-center w-[220px]">
          {tCommon("bills.columns.taxes")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {formatteCurrency(getTaxes(row.original))}
        </div>
      ),
    },

    {
      accessorKey: "fees",
      header: () => (
        <div className="text-center w-[220px]">
          {tCommon("bills.columns.fees")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {formatteCurrency(getFees(row.original))}
        </div>
      ),
    },

    {
      accessorKey: "total",
      header: () => (
        <div className="text-center w-[220px]">
          {tCommon("bills.columns.total")}
        </div>
      ),
      cell: ({ row }) => {
        const s = row.original;

        const total =
          s.total_cost +
          Number(getTaxes(s)) +
          Number(getFees(s));

        return (
          <div className="text-center font-medium">
            {formatteCurrency(total)}
          </div>
        );
      },
    },

    {
      accessorKey: "created_at",
      header: () => (
        <div className="text-center w-[240px]">
          {tCommon("bills.columns.created_at")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {formatDate(new Date(row.original.created_at))}
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
      setData(res.filter((el) => el.status == "pending"));
      setLoading(false);
    } catch (error) {
      console.log("from front", error);
    }
  };

  React.useEffect(() => {
    getData();
    if (salespointStatus == "idle") {
      dispatch(fetchSalesPoints());
    }
  }, []);

  return (
    <div className="space-y-5">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={salespointStatus === "loading" || loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* FILTERS */}
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

          {isAdmin() && (
            <SelectPopover
              selectedItems={selectedSalesPoints}
              items={salespoints}
              getOptionLabel={(o) => `${o.name} - ${o.address}`}
              onSelect={handleSelect}
              placeholder={tCommon("supply.placeholders.sales_points")}
              searchPlaceholder={tCommon("supply.placeholders.search_sales_points")}
              noItemText={tCommon("supply.empty.sales_points")}
            />
          )}

          <Button
            variant="primary"
            onClick={getData}
            className="w-full"
          >
            {tCommon("supply.actions.search")}
          </Button>

        </div>
      </CardBodyContent>

      {/* TABLE */}
      <CardBodyContent className="space-y-5 border select-none p-5">

        <h3 className="font-medium text-lg">
          {tCommon("supply.titles.pending_supply_orders")}
        </h3>

        <h3 className="font-medium text-base text-red-600">
          {tCommon("supply.warnings.supply_packaging")}
        </h3>

        <DataTableDemo
          setTableData={setTable}
          columns={columns}
          filterAttributes={["number"]}
          searchText={text}
          data={data.map((el, index) => ({
            ...el,
            number: index + 1,
          }))}
        >

          <div className="flex items-center justify-between py-4 max-w-sm">
            <Input
              placeholder={tCommon("supply.placeholders.search_supply_orders")}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="max-w-sm"
            />

          </div>

        </DataTableDemo>
      </CardBodyContent>
    </div>
  );
}

export default Page;
