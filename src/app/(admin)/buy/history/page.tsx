//@ts-nocheck
"use client";
import DateRangePicker from "@/components/DateRangePicker";
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
import { datesData, status, statusBuy } from "@/utils/constants";
import { Backdrop, CircularProgress } from "@mui/material";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import moment from "moment";
import { getBill, getSupplies } from "../../sell/functions";
import { formatteCurrency } from "../../stock/functions";
import { ActionComponent } from "../in_progress/ActionComponent";
import { fetchSuppliers } from "@/redux/suppliersSlicer";

function Page() {
  const [pickedDateRange, setPickedDateRange] = React.useState<DateRange>({
    from: new Date().toString(),
    to: new Date().toString(),
  });

  const [table, setTable] = React.useState<any | null>(null);
  const [data, setData] = React.useState<Supply[]>([]);
  const [loading, setLoading] = React.useState(false);

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

  const { data: suppliers, status: suppliersStatus } = useSelector(
    (state: RootState) => state.suppliers
  );

  const handleDateRangeChange = (range: DateRange) => {
    setPickedDateRange(range);
  };

  const columns: ColumnDef<Supply>[] = [
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
      accessorKey: "Numero de bon",
      header: () => (
        <div className="text-left w-[140px]">Numero de facture</div>
      ),
      cell: ({ row }) => {
        return <div className="capitalize">{row.original.supply_number}</div>;
      },
    },
    {
      accessorKey: "Point de vente",
      header: () => <div className="text-center w-[220px]">Point de vente</div>,
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
            Operateur
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="capitalize text-center text-base font-medium">
            {row.original.operator_details?.name}{" "}
            {row.original.operator_details?.surname}
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
            // onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Nombre de colis</span>
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        const supply_product: SupplyProduct[] = row.original.supply_products;
        return (
          <div className="capitalize text-center  w-[100px]">
            {supply_product.reduce(
              (acc, curr) => (acc = acc + curr.quantity),
              0
            )}
          </div>
        );
      },
      footer: () => {
        const totalQty = data.reduce((total, supply) => {
          return (
            total +
            supply.supply_products.reduce((subtotal, supply_product) => {
              return subtotal + supply_product.quantity;
            }, 0)
          );
        }, 0);
        return <div className="text-center">{totalQty}</div>;
      },
    },
    {
      accessorKey: "Montant",
      header: () => (
        <div>
          <h6 className="text-right text-base w-[220px]">Montant</h6>
        </div>
      ),
      cell: ({ row }) => {
        const supply_products: SupplyProduct[] = row.original.supply_products;
        const total = supply_products.reduce(
          (acc, curr) => (acc = acc + Number(curr.price) * curr.quantity),
          0
        );
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XAF",
        }).format(total);

        return <div className="text-right font-medium">{formatted}</div>;
      },
      footer: () => {
        const totalAmount = data.reduce((total, supply) => {
          return (
            total +
            supply.supply_products.reduce((subtotal, supply_product) => {
              return (
                subtotal +
                Number(supply_product.price) * supply_product.quantity
              );
            }, 0)
          );
        }, 0);
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XAF",
        }).format(totalAmount);

        return <div className="text-right">{formatted}</div>;
      },
    },
    {
      accessorKey: "Taxes",
      header: () => (
        <div>
          <h6 className="text-right text-base w-[220px]">Taxes</h6>
        </div>
      ),
      cell: ({ row }) => {
        const taxes = row.original.invoice_history[0]["tax_details"];
        return (
          <div className="text-right font-medium">
            {formatteCurrency(taxes.total_tax_amount ?? 0, "XAF", "fr-FR")}
          </div>
        );
      },
      footer: () => {
        return <div className="text-center"> - </div>;
      },
    },
    {
      accessorKey: "Frais supplementaires",
      header: () => (
        <div>
          <h6 className="text-right text-base w-[220px]">
            Frais supplementaires
          </h6>
        </div>
      ),
      cell: ({ row }) => {
        const fee = row.original.invoice_history[0]["fee_details"];

        return (
          <div className="text-right font-medium">
            {formatteCurrency(fee.total_fee_amount ?? 0, "XAF", "fr-FR")}
          </div>
        );
      },
      footer: () => {
        return <div className="text-center"> - </div>;
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
        const sup = row.original;
        return (
          <div className="text-right font-medium">
            {formatteCurrency(
              sup.total_cost +
                Number(sup.invoice_history[0]["tax_details"].total_tax_amount) +
                Number(sup.invoice_history[0]["fee_details"].total_fee_amount),
              "XAF",
              "fr-FR"
            )}
          </div>
        );
      },
      footer: () => {
        const total = data.reduce(
          (acc, curr) =>
            (acc =
              acc +
              (curr.total_cost +
                Number(
                  curr.invoice_history[0]["tax_details"].total_tax_amount
                ) +
                Number(
                  curr.invoice_history[0]["fee_details"].total_fee_amount
                ))),
          0
        );
        return (
          <div className="text-right">
            {" "}
            {formatteCurrency(total, "XAF", "fr-FR")}
          </div>
        );
      },
    },
    {
      accessorKey: "Date de création",
      header: () => <div className="text-center w-[240px]">Status</div>,
      cell: ({ row }) => {
        return (
          <div className={cn("text-center font-medium")}>
            <span
              className={cn(
                "p-2 rounded ",
                row.original.status === "pending"
                  ? "bg-red-500"
                  : "bg-green-500"
              )}
            >
              {statusBuy[row.original.status]}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "Date de création",
      header: () => (
        <div className="text-center w-[240px]">Date de création</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {moment(row.original.created_at).format("DD/MM/YYYY HH:mm:ss")}
          </div>
        );
      },
    },
    {
      accessorKey: "Date de livraison",
      header: () => (
        <div className="text-center w-[240px]">Date de livraison</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {moment(row.original.received_at ?? undefined).format(
              "DD/MM/YYYY HH:mm:ss"
            )}
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
          supply={row.original}
          onGetData={getData}
          onSetLoading={(el) => setLoading(el)}
          loading={loading}
          page="history"
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
        sales_point: selectedSalesPoints,
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
      <div className="shadow border select-none border-neutral-300 rounded-lg bg-white p-5">
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
          <SelectPopover
            selectedItems={selectedSalesPoints}
            items={salespoints}
            getOptionLabel={(option) => `${option.name} - ${option.address}`}
            onSelect={handleSelect}
            placeholder="Points de vente"
          />
          <SelectPopover
            selectedItems={selectedSuppliers}
            items={suppliers}
            getOptionLabel={(option) =>
              `${option.name} - ${option.sales_point_details.name}`
            }
            onSelect={handleSelectSupplier}
            placeholder="Fournisseurs"
            noItemText="Aucun fournisseur trouvé"
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
      <div className="space-y-5  yshadow border select-none border-neutral-300 rounded-lg bg-white p-5">
        <h3 className="font-medium text-lg">Historique d&apos;achat</h3>
        <DataTableDemo
          setTableData={setTable}
          columns={columns}
          data={data
            .map((el, index) => {
              return { ...el, number: index + 1 };
            })
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))}
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
    </div>
  );
}

export default Page;
