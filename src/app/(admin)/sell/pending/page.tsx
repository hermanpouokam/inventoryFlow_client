"use client";
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import moment from "moment";
import { CircularProgress, Backdrop } from "@mui/material";
import { DataTableDemo } from "@/components/TableComponent";
import { Input } from "@/components/ui/input";
import { ColumnDef, Row } from "@tanstack/react-table";
import { getBill } from "../functions";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch } from "react-redux";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { fetchEmployees } from "@/redux/employeesSlicer";
import { toast } from "@/components/ui/app-toast";
import SelectPopover from "@/components/SelectPopover";
import { fetchClients } from "@/redux/clients";
import { ActionComponent } from "./ActionComponent";
import { formatteCurrency } from "../../stock/functions";
import { usePermission } from "@/context/PermissionContext";
import CardBodyContent from "@/components/CardContent";
import { getDatesData } from "./functions";
import { useTranslation } from "react-i18next";
import { DateRangePicker } from "@/components/DateRangePicker";


export default function Page() {
  const { t: tCommon } = useTranslation("common")
  const [pickedDateRange, setPickedDateRange] = React.useState<{
    from: Date | null;
    to: Date | null;
  } | null>({ from: new Date(), to: new Date() });

  const [customer, setCustomer] = React.useState<Customer[]>([]);
  const [table, setTable] = React.useState<any | null>(null);
  const [data, setData] = React.useState<Bill[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");

  const [selectedSalesPoints, setSelectedSalesPoints] = React.useState<
    SalesPoint[]
  >([]);
  const { user, hasPermission, isAdmin } = usePermission()
  const dispatch: AppDispatch = useDispatch();

  const { data: salespoints, status: salespointStatus } = useSelector(
    (state: RootState) => state.salesPoints
  );
  const { data: employees, status: statusEmployees } = useSelector(
    (state: RootState) => state.employees
  );

  const { data: customers, status: statusCustomers } = useSelector(
    (state: RootState) => state.clients
  );

  const datesData = useMemo(() => getDatesData(tCommon), [tCommon]);

  const columns: ColumnDef<Bill>[] = [
    {
      accessorKey: "number",
      header: () => <div className="w-[20px] text-center">#</div>,
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
          bill={row.original}
          employees={employees}
          onGetData={getData}
          onSetLoading={(el) => setLoading(el)}
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
        <div className="capitalize text-center">{row.getValue("bill_number")}</div>
      ),
    },
    ...(isAdmin() ? [{
      accessorKey: "sales_point",
      header: () => (
        <div className="text-center w-[220px]">
          {tCommon("bills.columns.sales_point")}
        </div>
      ),
      cell: ({ row }: { row: Row<Bill> }) => (
        <div className="text-center capitalize truncate">
          {row.original.sales_point_details.name} -{" "}
          {row.original.sales_point_details.address}
        </div>
      ),
    }] : []),
    {
      accessorKey: "customer_name",
      header: ({ column }) => {
        return (
          <div
            className="text-center cursor-pointer w-[220px]"
          >
            {tCommon("bills.columns.customer_name")}
          </div>
        );
      },
      cell: ({ row }) => {
        const customer_name: string = row.original.customer_name;
        return (
          <div className="capitalize text-center text-base font-medium">
            {customer_name}
          </div>
        );
      },
      footer: () => (
        <div className="text-right">
          {tCommon("bills.columns.total")}
        </div>
      ),
    },
    {
      accessorKey: "product_bills",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center w-[110px]"
          >
            <span>{tCommon("bills.columns.packages_count")}</span>
          </div>
        );
      },
      cell: ({ row }) => {
        const product_bills: ProductBill[] = row.getValue("product_bills");
        return (
          <div className="capitalize text-center  w-[100px]">
            {product_bills.reduce(
              (acc, curr) => (acc = acc + curr.quantity),
              0
            )}
          </div>
        );
      },
      footer: () => {
        const totalQty = data.reduce((total, bill) => {
          return (
            total +
            bill.product_bills.reduce((subtotal, product_bill) => {
              return subtotal + product_bill.quantity;
            }, 0)
          );
        }, 0);
        return <div className="text-center">{totalQty}</div>;
      },
    },
    {
      accessorKey: "product_bills",
      header: () => (
        <div>
          <h6 className="text-right w-[220px]">
            {tCommon("bills.columns.amount")}
          </h6>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">
            {formatteCurrency(row.original.total_amount)}
          </div>
        );
      },

      footer: () => {
        const totalAmount = data.reduce((total, bill) => {
          return total + bill.total_amount;
        }, 0);

        return (
          <div className="text-right">{formatteCurrency(totalAmount)}</div>
        );
      },
    },
    {
      accessorKey: "taxes",
      header: () => (
        <div>
          <h6 className="text-right w-[220px]">
            {tCommon("bills.columns.taxes")}
          </h6>
        </div>
      ),
      cell: ({ row }) => {
        const tax = row.original.taxes;
        const total = tax.reduce(
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
            bill.taxes.reduce((subtotal, taxe) => {
              return subtotal + (taxe.amount ?? 0);
            }, 0)
          );
        }, 0);

        return (
          <div className="text-right">{formatteCurrency(totalAmount)}</div>
        );
      },
    },
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
      accessorKey: "product_bills",
      header: () => (
        <div>
          <h6 className="text-right w-[220px]">
            {tCommon("bills.columns.total_amount")}
          </h6>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">
            {formatteCurrency(row.original.total_amount_with_taxes_fees)}
          </div>
        );
      },

      footer: () => {
        const totalAmount = data.reduce((total, bill) => {
          return total + bill.total_amount_with_taxes_fees;
        }, 0);

        return (
          <div className="text-right">{formatteCurrency(totalAmount)}</div>
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
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {moment(row.getValue("created_at")).format("DD/MM/YYYY HH:mm:ss")}
          </div>
        );

      },
    },
    {
      accessorKey: "delivery_date",
      header: () => (
        <div className="text-center w-[240px]">
          {tCommon("bills.columns.delivery_date")}
        </div>
      ),
      cell: ({ row }) => {

        return (
          <div className="text-center font-medium">
            {row.original.delivery_date
              ? moment(row.original.delivery_date).format("DD/MM/YYYY HH:mm:ss")
              : "-"}
          </div>
        );
      },
    },

  ];

  const handleSelect = (data: SalesPoint) => {
    setSelectedSalesPoints((prev) =>
      prev.includes(data)
        ? prev.filter((item) => item !== data)
        : [...prev, data]
    );
  };

  const handleSelectCustomers = (data: Customer) => {
    setCustomer((prev) =>
      prev.includes(data)
        ? prev.filter((item) => item !== data)
        : [...prev, data]
    );
  };

  const getData = async () => {
    setLoading(true);
    try {
      const params = {
        customer: customer.map(el => el.id),
        start_date: moment(pickedDateRange?.from).format(
          "YYYY-MM-DDT00:00:00.SSS"
        ),
        end_date: moment(pickedDateRange?.to).format("YYYY-MM-DDT23:59:59.SSS"),
        sales_point: isAdmin() ? selectedSalesPoints.map(el => el.id) : [user?.sales_point],
      };
      //@ts-ignore
      const res: Bill[] = await getBill(params);
      setData(res.filter((el) => el.state == "created"));
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    getData();
  }, []);

  React.useEffect(() => {
    if (salespointStatus === "idle") {
      dispatch(fetchSalesPoints());
    }
    if (statusEmployees === "idle") {
      dispatch(fetchEmployees({ sales_point: undefined }));
    }
    if (statusCustomers === "idle") {
      dispatch(
        fetchClients({ sales_points: selectedSalesPoints.map((el) => el.id) })
      );
    }

  }, [salespointStatus, statusEmployees, dispatch]);

  React.useEffect(() => {
    document.title = tCommon("bills.pending_title");
    if (statusEmployees !== "idle") {
      dispatch(fetchEmployees({ sales_point: undefined }));
    }
    if (statusCustomers !== "idle") {
      dispatch(
        fetchClients({ sales_points: selectedSalesPoints.map((el) => el.id) })
      );
    }
  }, [dispatch, selectedSalesPoints]);

  const handleDateRangeChange = (range: {
    from: Date | null;
    to: Date | null;
  }) => {
    setPickedDateRange(range);
  };

  return (
    <div className="space-y-5 ">
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
      <CardBodyContent className="shadow border select-none  rounded-lg  p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <DateRangePicker
            //@ts-ignore
            defaultDateRange={pickedDateRange}
            datesData={datesData}
            onDateRangeChange={(date) => {
              if (date.from && date.to) {
                //@ts-ignore
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
                placeholder={tCommon("filters.sales_points")}
                noItemText={tCommon("filters.no_sales_points")}
                searchPlaceholder={tCommon("filters.search_sales_point")}
              /> : null
          }
          <SelectPopover
            selectedItems={customer}
            items={customers}
            getOptionLabel={(option) => `${option.name}`}
            onSelect={handleSelectCustomers}
            placeholder={tCommon("filters.customers")}
          />

          <Button
            variant={"primary"}
            onClick={getData}
            className={cn(
              "w-full transition "
            )}
          >
            {tCommon("filters.search")}
          </Button>
        </div>
      </CardBodyContent>
      <CardBodyContent className="shadow border select-none rounded-lg p-5">
        <h3 className="font-medium text-base">
          {tCommon("orders.to_deliver")}
        </h3>
        <DataTableDemo
          setTableData={setTable}
          filterAttributes={["bill_number", "customer_name"]}
          searchText={searchText}
          columns={columns}
          data={data
            .map((el, index) => {
              return {
                ...el,
                number: index + 1,
              };
            })
            .filter((el) => el.state == "created")
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )}
        >
          <div className="flex items-center justify-between py-4">
            <div className="flex space-x-5">
              <Input
                placeholder={tCommon("orders.search_placeholder")}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="max-w-lg"
              />
            </div>
          </div>
        </DataTableDemo>
      </CardBodyContent>
    </div>
  );
}
