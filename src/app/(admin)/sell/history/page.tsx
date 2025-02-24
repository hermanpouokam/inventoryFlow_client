//@ts-nocheck
"use client";
import CardBodyContent from "@/components/CardContent";
import DateRangePicker from "@/components/DateRangePicker";
import SelectPopover from "@/components/SelectPopover";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { fetchClients } from "@/redux/clients";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { RootState } from "@/redux/store";
import { datesData, status } from "@/utils/constants";
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
  const { toast } = useToast();

  const getData = async () => {
    setLoading(true);
    try {
      const params = {
        customer: customer.map((el) => el.id),
        start_date: moment(pickedDateRange?.from).format(
          "YYYY-MM-DDT00:00:00.SSS"
        ),
        end_date: moment(pickedDateRange?.to).format("YYYY-MM-DDT23:59:59.SSS"),
        sales_point: selectedSalesPoints.map((el) => el.id),
      };
      const res: Bill[] = await getBill(params);
      setData(res);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    if (status == "idle") {
      dispatch(fetchSalesPoints({}));
    }
    if (statusCustomers == "idle") {
      dispatch(
        fetchClients({ sales_points: selectedSalesPoints.map((el) => el.id) })
      );
    }
  }, [dispatch]);

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
        fetchClients({ sales_points: selectedSalesPoints.map((el) => el.id) })
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
      header: () => <div className="w-[20px]">#</div>,
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("number")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-left w-[50px]">Actions</div>,
      cell: ({ row }) => <ActionComponent bill={row.original} />,
    },
    {
      accessorKey: "bill_number",
      header: () => (
        <div className="text-left w-[140px]">Numero de facture</div>
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("bill_number")}</div>
      ),
    },
    {
      accessorKey: "sales_point",
      header: () => <div className="text-left w-[220px]">Point de vente</div>,
      cell: ({ row }) => (
        <div className="text-center capitalize truncate">
          {row.original.sales_point_details.name} -{" "}
          {row.original.sales_point_details.address}
        </div>
      ),
    },
    {
      accessorKey: "customer_name",
      header: ({ column }) => {
        return (
          <div
            className="text-center w-[220px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nom du cilent
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="capitalize text-left text-base font-medium">
            {row.original.customer_name}
          </div>
        );
      },
      footer: () => <div className="text-right">Total</div>,
    },
    {
      accessorKey: "Nombre de colis",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center w-[110px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Nombre de colis</span>
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        const product_bills: ProductBill[] = row.original.product_bills;
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
          <h6 className="text-right text-base w-[220px]">
            Montant de la facture
          </h6>
        </div>
      ),
      cell: ({ row }) => {
        const bill = row.original;
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XAF",
        }).format(bill.total_bill_amount);

        return <div className="text-right font-medium">{formatted}</div>;
      },
      footer: () => {
        const totalAmount = data.reduce((total, bill) => {
          return total + bill.total_bill_amount;
        }, 0);
        const formatted = formatteCurrency(totalAmount, "XAF", "fr-FR");

        return <div className="text-right">{formatted}</div>;
      },
    },
    {
      accessorKey: "product_bills",
      header: () => (
        <div>
          <h6 className="text-right text-base w-[220px]">Benefice</h6>
        </div>
      ),
      cell: ({ row }) => {
        const product_bills: ProductBill[] = row.getValue("product_bills");
        const total = product_bills.reduce(
          (acc, curr) => (acc = acc + parseFloat(curr.benefit.toString())),
          0
        );
        const formatted = formatteCurrency(total, "XAF", "fr-FR");

        return <div className="text-right font-medium">{formatted}</div>;
      },
      footer: () => {
        const totalAmount = data.reduce((total, bill) => {
          return (
            total +
            bill.product_bills.reduce((subtotal, product_bill) => {
              return subtotal + parseFloat(product_bill.benefit.toString());
            }, 0)
          );
        }, 0);
        const formatted = formatteCurrency(totalAmount, "XAF", "fr-FR");
        return <div className="text-right">{formatted}</div>;
      },
    },
    {
      accessorKey: "Taxes",
      header: () => (
        <div>
          <h6 className="text-right text-base w-[220px]">Total taxes</h6>
        </div>
      ),
      cell: ({ row }) => {
        const bill = row.original;
        const totalTaxes = bill.taxes.reduce((total, tax) => {
          return total + tax.value;
        }, 0);
        const formatted = formatteCurrency(totalTaxes, "XAF", "fr-FR");

        return <div className="text-right font-medium">{formatted}</div>;
      },
      footer: () => {
        return <div className="text-center">-</div>;
      },
    },
    {
      accessorKey: "Montant total",
      header: () => (
        <div>
          <h6 className="text-right text-base w-[220px]">Montant total</h6>
        </div>
      ),
      cell: ({ row }) => {
        const bill = row.original;
        const totalTaxes = bill.taxes.reduce((total, tax) => {
          return total + tax.value;
        }, 0);
        const formatted = formatteCurrency(
          totalTaxes + bill.total_bill_amount,
          "XAF",
          "fr-FR"
        );
        return <div className="text-right font-medium">{formatted}</div>;
      },
      footer: () => {
        return <div className="text-center">-</div>;
      },
    },
    {
      accessorKey: "Status",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center w-[110px] "
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Status</span>
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        const bill: Bill = row.original;

        return (
          <div
            className={cn(
              "capitalize text-center p-2 rounded-full w-[70px]",
              bill.state == "created" && "bg-red-500",
              bill.state == "pending" && "bg-orange-500",
              bill.state == "success" && "bg-green-500",
              bill?.total_bill_amount < Number(bill?.paid) && "bg-orange-500"
            )}
          >
            {status[bill.state]}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: () => <div className="text-center w-[240px]">Date</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {moment(row.getValue("created_at")).format("DD/MM/YYYY hh:mm:ss")}
          </div>
        );
      },
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
        <h2 className="text-base font-semibold">Encaisser une facture</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          <DateRangePicker
            defaultDateRange={pickedDateRange}
            datesData={datesData}
            onDateRangeChange={(date) => {
              if (date.from && date.to) {
                handleDateRangeChange(date);
              }
            }}
          />
          <SelectPopover
            selectedItems={selectedSalesPoints}
            items={salespoints}
            onSelect={handleSelect}
            getOptionLabel={(option) => `${option.name} - ${option.address}`}
            placeholder="Point de vente"
          />
          <SelectPopover
            selectedItems={customer}
            items={customers}
            onSelect={handleSelectCustomers}
            getOptionLabel={(option) => `${option.name} - ${option.address}`}
            placeholder="Clients"
          />
          <Button
            variant={"outline"}
            onClick={getData}
            // disabled={}
            className={cn(
              "w-full bg-green-600 hover:bg-green-700 hover:text-white text-white"
            )}
          >
            Rechercher
          </Button>
        </div>
      </CardBodyContent>
      <div className="shadow border select-none border-neutral-300 rounded-lg bg-white p-5">
        <h3 className="font-medium text-base">Historique de facture</h3>
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
                placeholder="Filtrer par articles..."
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
                className="max-w-sm"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Colonnes <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    ?.getAllColumns()
                    .filter((column: any) => column.getCanHide())
                    .map((column: any) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DataTableDemo>
      </div>
    </main>
  );
}
