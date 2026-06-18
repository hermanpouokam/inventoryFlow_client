//@ts-nocheck
"use client";
import CardBodyContent from "@/components/CardContent";
import SelectPopover from "@/components/SelectPopover";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/app-toast";
import { cn } from "@/lib/utils";
import { fetchClients } from "@/redux/clients";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { RootState } from "@/redux/store";
import { datesData } from "@/utils/constants";
import { Backdrop, CircularProgress } from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { getBill } from "../functions";
import moment from "moment";
import { DataTableDemo } from "@/components/TableComponent";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { formatteCurrency } from "../../stock/functions";
import { ActionComponent } from "./ActionComponent";
import { usePermission } from "@/context/PermissionContext";
import { formatDate } from "@/utils/formatDate";
import { DateRangePicker } from "@/components/DateRangePicker";
import { useTranslation } from "react-i18next";

export default function Page() {
  const [pickedDateRange, setPickedDateRange] = React.useState<{
    from: Date | null;
    to: Date | null;
  } | null>({ from: new Date(), to: new Date() });
  const [customer, setCustomer] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedSalesPoints, setSelectedSalesPoints] = React.useState<
    SalesPoint[]
  >([]);
  const [data, setData] = React.useState<Bill[]>([]);
  const [table, setTable] = React.useState<any | null>(null);
  const { hasPermission, user, isAdmin } = usePermission()
  const { t: tCommon } = useTranslation("common");


  const handleDateRangeChange = (range: {
    from: Date | null;
    to: Date | null;
  }) => {
    setPickedDateRange(range);
  };
  const {
    data: salespoints,
    status: salespointStatus,
    error: salespointError,
  } = useSelector((state: RootState) => state.salesPoints);

  const {
    data: employees,
    error: errorEmployees,
    status: statusEmployees,
  } = useSelector((state: RootState) => state.employees);

  const {
    data: customers,
    error: errorCustomers,
    status: statusCustomers,
  } = useSelector((state: RootState) => state.clients);

  const dispatch = useDispatch();

  const getData = async () => {
    setLoading(true);
    try {
      const params = {
        customer: customer.map((el) => el.id),
        start_date: moment(pickedDateRange?.from).format(
          "YYYY-MM-DDT00:00:00.SSS"
        ),
        end_date: moment(pickedDateRange?.to).format("YYYY-MM-DDT23:59:59.SSS"),
        sales_point: isAdmin() ? selectedSalesPoints.map((el) => el.id) : [user?.sales_point],
      };
      const res: Bill[] = await getBill(params);
      setData(res);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    if (salespointStatus == "idle" && isAdmin()) {
      dispatch(fetchSalesPoints());
    }
    if (statusCustomers == "idle") {
      dispatch(
        fetchClients({ sales_points: isAdmin() ? selectedSalesPoints.map((el) => el.id) : [] })
      );
    }
  }, [dispatch, salespointStatus, statusCustomers]);

  const handleSelect = (data: SalesPoint) => {
    setSelectedSalesPoints((prev) =>
      prev.includes(data)
        ? prev.filter((item) => item !== data)
        : [...prev, data]
    );
  };

  React.useEffect(() => {
    if (statusCustomers !== "idle") {
      dispatch(
        fetchClients({ sales_points: isAdmin() ? selectedSalesPoints.map((el) => el.id) : [user?.sales_point] })
      );
    }
    getData();
  }, [selectedSalesPoints]);

  const handleSelectCustomers = (data: Customer) => {
    setCustomer((prev) =>
      prev.includes(data)
        ? prev.filter((item) => item !== data)
        : [...prev, data]
    );
  };

  const columns: ColumnDef<Bill>[] = [
    {
      accessorKey: "number",
      header: () => <div className="w-[20px]">{tCommon("bills.columns.number")}</div>,
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("number")}</div>
      ),
    },

    {
      id: "actions",
      enableHiding: false,
      header: () => (
        <div className="text-left w-[50px]">
          {tCommon("bills.columns.actions")}
        </div>
      ),
      cell: ({ row }) => (
        <ActionComponent
          onGetData={getData}
          onSetLoading={setLoading}
          bill={row.original}
          loading={loading}
        />
      ),
    },

    {
      accessorKey: "bill_number",
      header: () => (
        <div className="text-center w-[140px]">
          {tCommon("bills.columns.bill_number")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center capitalize">
          {row.getValue("bill_number")}
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
          cell: ({ row }) => (
            <div className="text-center truncate">
              {row.original.sales_point_details.name} -{" "}
              {row.original.sales_point_details.address}
            </div>
          ),
        },
      ]
      : []),

    {
      accessorKey: "customer_name",
      header: ({ column }) => (
        <div
          className="text-center w-[220px] cursor-pointer"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          {tCommon("bills.columns.customer_name")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.original.customer_name}
        </div>
      ),
      footer: () => (
        <div className="text-right">
          {tCommon("bills.columns.total")}
        </div>
      ),
    },

    {
      accessorKey: "packages_count",
      header: ({ column }) => (
        <div
          className="flex justify-center w-[110px]"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          <span>{tCommon("bills.columns.packages_count")}</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.product_bills.reduce(
            (acc, curr) => acc + curr.quantity,
            0
          )}
        </div>
      ),
    },

    {
      accessorKey: "amount",
      header: () => (
        <h6 className="text-right w-[220px]">
          {tCommon("bills.columns.amount")}
        </h6>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {formatteCurrency(row.original.total_amount)}
        </div>
      ),
    },

    ...(hasPermission("view_daily_report") ||
      hasPermission("view_monthly_report")
      ? [
        {
          accessorKey: "benefit",
          header: () => (
            <h6 className="text-center w-[220px]">
              {tCommon("bills.columns.benefit")}
            </h6>
          ),
          cell: ({ row }) => {
            const total = row.original.product_bills.reduce(
              (acc, curr) => acc + Number(curr.benefit),
              0
            );
            return (
              <div className="text-center font-medium">
                {formatteCurrency(total)}
              </div>
            );
          },
        },
      ]
      : []),
    {
      accessorKey: "additional_fees",
      header: () => (
        <div>
          <h6 className="text-right w-[220px]">
            {tCommon("bills.columns.additional_fees")}
          </h6>
        </div>
      ),
      cell: ({ row }) => {
        const fees = row.original.additional_fees;
        const total = fees.reduce(
          (acc, curr) => (acc = acc + Number(curr.amount)),
          0
        );

        return (
          <div className="text-right font-medium">
            {formatteCurrency(total ?? 0)}
          </div>
        );
      },
      footer: () => {
        const totalAmount = data.reduce((total, bill) => {
          return (
            total +
            bill.additional_fees.reduce((subtotal, additional_fee) => {
              return subtotal + Number(additional_fee.amount);
            }, 0)
          );
        }, 0);
        return (
          <div className="text-right">{formatteCurrency(totalAmount)}</div>
        );
      },
    },
    {
      accessorKey: "taxes",
      header: () => (
        <h6 className="text-center w-[220px]">
          {tCommon("bills.columns.taxes")}
        </h6>
      ),
      cell: ({ row }) => {
        const total = row.original.taxes.reduce(
          (acc, curr) => acc + curr.amount,
          0
        );
        return (
          <div className="text-center font-medium">
            {formatteCurrency(total)}
          </div>
        );
      },
    },

    {
      accessorKey: "total_amount",
      header: () => (
        <h6 className="text-center w-[220px]">
          {tCommon("bills.columns.total_amount")}
        </h6>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {formatteCurrency(row.original.total_amount_with_taxes_fees)}
        </div>
      ),
    },

    {
      accessorKey: "status",
      header: () => (
        <div className="text-center w-[110px]">
          {tCommon("bills.columns.status")}
        </div>
      ),
      cell: ({ row }) => {
        const bill = row.original;

        return (
          <div className="flex justify-center">
            {tCommon(`status_values.${bill.state}`)}
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
          {moment(row.getValue("created_at")).format("DD/MM/YYYY HH:mm:ss")}
        </div>
      ),
    },
  ];
  return (
    <main className="space-y-5">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={
          salespointStatus == "loading" ||
          statusEmployees == "loading" ||
          loading
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardBodyContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
              onSelect={handleSelect}
              getOptionLabel={(option) => `${option.name} - ${option.address}`}
              placeholder={tCommon("sales_points.singular")}
              searchPlaceholder={tCommon("sales_points.search")}
            /> : null
          }
          <SelectPopover
            selectedItems={customer}
            items={customers}
            onSelect={handleSelectCustomers}
            getOptionLabel={(option) => `${option.name} ${option.surname}`}
            placeholder={tCommon("customers.label")}
            searchPlaceholder={tCommon("customers.search")}
          />
          <Button
            variant={"primary"}
            onClick={getData}
            // disabled={}
            className={cn(
              "w-full"
            )}
          >
            {tCommon("search.action")}
          </Button>
        </div>
      </CardBodyContent>
      <CardBodyContent className="shadow border select-none  rounded-lg  p-5">
        <h3 className="font-medium text-base">{tCommon("billing.invoice_history")}</h3>
        <DataTableDemo
          setTableData={setTable}
          columns={columns}
          data={data.map((el, index) => {
            return { ...el, number: index + 1 };
          })}
        >
          <div className="flex items-center justify-between py-4">
            <div className="flex space-x-5">
              <Input
                placeholder={tCommon("sell.filter_articles")}
                value={
                  (table
                    ?.getColumn("bill_number")
                    ?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table
                    ?.getColumn("bill_number")
                    ?.setFilterValue(event.target.value)
                }
                className="max-w-md"
              />
            </div>
          </div>
        </DataTableDemo>
      </CardBodyContent>
    </main>
  );
}
