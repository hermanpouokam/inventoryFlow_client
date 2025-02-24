"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import moment from "moment";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircularProgress, Backdrop } from "@mui/material";
import { DataTableDemo } from "@/components/TableComponent";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { getBill } from "../functions";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch } from "react-redux";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { fetchEmployees } from "@/redux/employeesSlicer";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import SelectPopover from "@/components/SelectPopover";
import { fetchClients } from "@/redux/clients";
import DateRangePicker from "@/components/DateRangePicker";
import { ActionComponent } from "./ActionComponent";
import { formatteCurrency } from "../../stock/functions";

const datesData = [
  {
    name: "Aujourd'hui",
    value: {
      from: moment().format("llll"),
      to: moment().format("llll"),
    },
  },
  {
    name: "Hier",
    value: {
      from: moment().subtract(1, "days").format("llll"),
      to: moment().subtract(1, "days").format("llll"),
    },
  },
  {
    name: "Cette semaine",
    value: {
      from: moment().startOf("isoWeek").format("llll"),
      to: moment().endOf("isoWeek").format("llll"),
    },
  },
  {
    name: "Ce mois-ci",
    value: {
      from: moment().startOf("month").format("llll"),
      to: moment().endOf("month").format("llll"),
    },
  },
  {
    name: "Le mois dernier",
    value: {
      from: moment().subtract(1, "month").startOf("month").format("llll"),
      to: moment().subtract(1, "month").endOf("month").format("llll"),
    },
  },
  {
    name: "Cette année",
    value: {
      from: moment().startOf("year").format("llll"),
      to: moment().endOf("year").format("llll"),
    },
  },
  {
    name: "L'année dernière",
    value: {
      from: moment().subtract(1, "year").startOf("year").format("llll"),
      to: moment().subtract(1, "year").endOf("year").format("llll"),
    },
  },
];

export default function Page() {
  const { toast } = useToast();

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

  const columns: ColumnDef<Bill>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          className="ring-white"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "number",
      header: () => <div className="w-[20px]">#</div>,
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("number")}</div>
      ),
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
        <div className="text-left capitalize truncate">
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
            className="flex cursor-pointer w-[220px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nom du cilent
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        const customer_name: string = row.original.customer_name;
        return (
          <div className="capitalize text-left text-base font-medium">
            {customer_name}
          </div>
        );
      },
      footer: () => <div className="text-right">Total</div>,
    },
    {
      accessorKey: "product_bills",
      header: () => (
        <div>
          <h6 className="text-right w-[220px]">Montant de la facture</h6>
        </div>
      ),
      cell: ({ row }) => {
        const product_bills: ProductBill[] = row.original.product_bills;
        const total = product_bills.reduce(
          (acc, curr) => (acc = acc + Number(curr.total_amount)),
          0
        );
        return (
          <div className="text-right font-medium">
            {formatteCurrency(total)}
          </div>
        );
      },

      footer: () => {
        const totalAmount = data.reduce((total, bill) => {
          return (
            total +
            bill.product_bills.reduce((subtotal, product_bill) => {
              return subtotal + Number(product_bill.total_amount);
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
        <div>
          <h6 className="text-right w-[220px]">Taxes</h6>
        </div>
      ),
      cell: ({ row }) => {
        const tax = row.original.taxes;
        const total = tax.reduce(
          (acc, curr) => (acc = acc + Number(curr.total)),
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
              return subtotal + (taxe.total ?? 0);
            }, 0)
          );
        }, 0);

        return (
          <div className="text-right">{formatteCurrency(totalAmount)}</div>
        );
      },
    },
    {
      accessorKey: "Frais supplementaires",
      header: () => (
        <div>
          <h6 className="text-right w-[220px]">Frais supplementaires</h6>
        </div>
      ),
      cell: ({ row }) => {
        const fees = row.original.additional_fees;
        const total = fees.reduce(
          (acc, curr) => (acc = acc + Number(curr.total)),
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
              return subtotal + Number(additional_fee.total);
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
      accessorKey: "created_at",
      header: () => (
        <div className="text-center w-[240px]">Date de creation</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {moment(row.getValue("created_at")).format("DD/MM/YYYY hh:mm:ss")}
          </div>
        );
      },
    },
    {
      accessorKey: "delivered_at",
      header: () => (
        <div className="text-center w-[240px]">Date de livraison</div>
      ),
      cell: ({ row }) => {
        // Format the amount as a dollar amount

        return (
          <div className="text-center font-medium">
            {moment(row.getValue("delivered_at")).format("DD/MM/YYYY")}
          </div>
        );
      },
    },

    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-left w-[50px]">Actions</div>,
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
        customer: customer,
        start_date: moment(pickedDateRange?.from).format(
          "YYYY-MM-DDT00:00:00.SSS"
        ),
        end_date: moment(pickedDateRange?.to).format("YYYY-MM-DDT23:59:59.SSS"),
        sales_point: selectedSalesPoints,
      };
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
    if (status === "idle") {
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
  }, [status, statusEmployees, dispatch]);

  React.useEffect(() => {
    document.title = "Facture en attente";
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
    <div className="space-y-5">
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
      <div className="shadow border select-none border-neutral-300 rounded-lg bg-white p-5">
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
            getOptionLabel={(option) => `${option.name} - ${option.address}`}
            onSelect={handleSelect}
            // displayProperties={["name", "address"]}
            placeholder="Points de vente"
          />
          <SelectPopover
            selectedItems={customer}
            items={customers}
            getOptionLabel={(option) => `${option.name}`}
            onSelect={handleSelectCustomers}
            // displayProperties={["name"]}
            placeholder="Clients"
          />

          <Button
            variant={"outline"}
            onClick={getData}
            className={cn(
              "w-full bg-green-600 hover:bg-green-700 hover:text-white text-white"
            )}
          >
            Rechercher
          </Button>
        </div>
      </div>
      <div className="shadow border select-none border-neutral-300 rounded-lg bg-white p-5">
        <h3 className="font-medium text-base">Commandes à livrer</h3>
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
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))}
        >
          <div className="flex items-center justify-between py-4">
            <div className="flex space-x-5">
              <Input
                placeholder="Numero de facture ou nom du client..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="max-w-lg"
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
    </div>
  );
}
