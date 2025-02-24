"use client";
import CardBodyContent from "@/components/CardContent";
import DateRangePicker from "@/components/DateRangePicker";
import { DataTableDemo } from "@/components/TableComponent";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { fetchBills } from "@/redux/billSlicer";
import { fetchSalesPoints } from "@/redux/salesPointsSlicer";
import { AppDispatch, RootState } from "@/redux/store";
import { datesData } from "@/utils/constants";
import {
  Backdrop,
  CircularProgress,
  DialogActions,
  DialogContentText,
  TextField,
  Dialog as MuiDialog,
  DialogContent as MuiDialogContent,
  DialogTitle as MuiDialogTitle,
  Button as MuiButton,
} from "@mui/material";
import {
  ArrowDownToLine,
  Check,
  EllipsisVertical,
  EyeIcon,
  WalletCards,
} from "lucide-react";
import moment from "moment";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import BillDetails from "../pending/BillDetails";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { formatteCurrency } from "../../stock/functions";
import { updatePaid } from "@/components/fetch";
import { useToast } from "@/components/ui/use-toast";
import { fetchClients } from "@/redux/clients";
import { useSearchParams } from "next/navigation";
import SelectPopover from "@/components/SelectPopover";
import { getBill } from "../functions";

export default function Page() {
  const searchParams = useSearchParams();
  const [pickedDateRange, setPickedDateRange] = React.useState<{
    from: Date | null;
    to: Date | null;
  } | null>({ from: new Date(), to: new Date() });
  const [table, setTable] = React.useState<any | null>(null);
  const [selectedSalespoint, setSelectedSalespoint] = React.useState<
    SalesPoint[]
  >([]);
  const [loading, setLoading] = React.useState(false);
  const handleDateRangeChange = (range: {
    from: Date | null;
    to: Date | null;
  }) => {
    setPickedDateRange(range);
  };
  const {
    data: customers,
    status: statusCustomer,
    error: errorCustomer,
  } = useSelector((state: RootState) => state.clients);
  const [data, setdata] = React.useState<Bill[]>([]);
  const [customer, setCustomer] = React.useState<Customer[]>([]);

  const dispatch: AppDispatch = useDispatch();
  const {
    data: salesPoints,
    status,
    error,
  } = useSelector((state: RootState) => state.salesPoints);

  const { toast } = useToast();
  React.useEffect(() => {
    if (status == "idle") {
      dispatch(fetchSalesPoints({}));
    }
    if (statusCustomer == "idle") {
      dispatch(fetchClients({}));
    }
  }, [dispatch, status]);

  const handleSelect = (data: SalesPoint) => {
    setSelectedSalespoint((prev) =>
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
        sales_point: selectedSalespoint,
      };
      //@ts-ignore
      const res: Bill[] = await getBill(params);
      setdata(res.filter((el) => el.state == "pending"));
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(event.currentTarget);
      const formJson = Object.fromEntries((formData as any).entries());
      const { paid_amount, bill_id } = formJson;
      const response = await updatePaid(paid_amount, bill_id);
      if (response?.data.detail) {
        toast({
          variant: "default",
          className:
            "bg-green-700 border-green-700 text-white text-base font-semibold",
          title: "Succès",
          description: "Facture encaissée avec succès",
        });
        dispatch(fetchBills({ state: "pending" }));
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Une erreur est survenu veuillez réessayer`,
        variant: "destructive",
        className: "bg-red-800 border-red-800",
        icon: <Check className="mr-2" />,
      });
    }
    await getData();
  };

  const handleSelectCustomers = (data: Customer) => {
    setCustomer((prev) =>
      prev.includes(data)
        ? prev.filter((item) => item !== data)
        : [...prev, data]
    );
  };

  React.useEffect(() => {
    getData();
  }, []);

  React.useEffect(() => {
    if (statusCustomer !== "idle") {
      dispatch(
        fetchClients({ sales_points: selectedSalespoint.map((el) => el.id) })
      );
    }
  }, [dispatch, selectedSalespoint]);

  const columns: ColumnDef<Bill>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="w-12 flex justify-center items-center">
          <Checkbox
            className="ring-white border-white"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="w-12 flex justify-center items-center">
          <Checkbox
            className="border-white"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "number",
      header: () => <div className="w-[20px] text-center">#</div>,
      cell: ({ row }) => (
        <div className="lowercase text-center">{row.getValue("number")}</div>
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
            className="text-center cursor-pointer w-[220px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nom du cilent
          </div>
        );
      },
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="capitalize text-center text-base font-medium">
            {customer.customer_name}
          </div>
        );
      },
      footer: () => <div className="text-right">Total</div>,
    },
    {
      accessorKey: "product_bills",
      header: () => (
        <div>
          <h6 className="text-right text-base w-[220px]">Montant total</h6>
        </div>
      ),
      cell: ({ row }) => {
        const product_bills: ProductBill[] = row.getValue("product_bills");
        const total = product_bills.reduce(
          (acc, curr) => (acc = acc + parseFloat(curr.total_amount.toString())),
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
              return (
                subtotal + parseFloat(product_bill.total_amount.toString())
              );
            }, 0)
          );
        }, 0);
        const formatted = formatteCurrency(totalAmount, "XAF", "fr-FR");
        return <div className="text-right">{formatted}</div>;
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
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-left w-[50px]">Actions</div>,
      cell: ({ row }) => {
        const bill = row.original;
        const [open, setOpen] = React.useState(false);
        const [openPopup, setOpenPopup] = React.useState(false);

        const PopUp = ({ isOpen }: { isOpen: boolean }) => {
          const handleClose = () => {
            setOpenPopup(false);
          };

          return (
            <MuiDialog
              open={isOpen}
              onClose={handleClose}
              PaperProps={{
                component: "form",
                onSubmit: onSubmit,
              }}
            >
              <MuiDialogTitle>
                Encaisser la facture {bill.bill_number}
              </MuiDialogTitle>
              <MuiDialogContent>
                <DialogContentText>
                  Entrez le montant verser pour cette facture et validez
                </DialogContentText>
                <div className="mt-2"></div>
                <TextField
                  autoFocus
                  required
                  margin="dense"
                  name="total_amount"
                  label="Montant total"
                  value={bill.total_amount_with_taxes_fees}
                  type="number"
                  size="small"
                  fullWidth
                />
                <TextField
                  autoFocus
                  required
                  margin="dense"
                  name="paid_amount"
                  label="Montant payé"
                  type="number"
                  size="small"
                  defaultValue={bill.total_amount_with_taxes_fees}
                  fullWidth
                />
                <input
                  type="text"
                  hidden={true}
                  name="bill_id"
                  value={bill.id}
                />
              </MuiDialogContent>
              <DialogActions>
                <MuiButton
                  disabled={loading}
                  onClick={handleClose}
                  color="error"
                >
                  Annuler
                </MuiButton>
                <MuiButton disabled={loading} type="submit" color="success">
                  {loading ? "Veuillez patienter..." : "Encaisser"}
                </MuiButton>
              </DialogActions>
            </MuiDialog>
          );
        };

        const handleOpenPdf = async () => {
          try {
            const response = await fetch("http://localhost:5000/generate-pdf", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ bill }),
            });

            if (!response.ok) {
              throw new Error("Error fetching PDF");
            }

            const pdfBlob = await response.blob();

            const blobUrl = URL.createObjectURL(pdfBlob);

            window.open(blobUrl, "_blank");
          } catch (error) {
            console.error("Failed to fetch PDF:", error);
          } finally {
          }
        };

        return (
          <>
            <PopUp isOpen={openPopup} />
            <Dialog open={open}>
              <DialogContent className="sm:max-w-full max-h-full overflow-auto p-5">
                <DialogHeader>
                  <DialogTitle>{bill.bill_number}</DialogTitle>
                  <DialogDescription></DialogDescription>
                </DialogHeader>
                <div className="">
                  <BillDetails bill={bill} setClose={() => setOpen(false)} />
                </div>
                <DialogFooter className="sm:justify-start">
                  <DialogClose asChild>
                    <Button
                      onClick={() => setOpen(false)}
                      type="button"
                      variant="destructive"
                    >
                      Fermer
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleOpenPdf()}>
                  <EyeIcon size={14} className="mr-3" />
                  Voir les details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenPopup(true)}>
                  {" "}
                  <ArrowDownToLine className="mr-3" size={14} />
                  Retour d'emballage
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenPopup(true)}>
                  {" "}
                  <WalletCards className="mr-3" size={14} />
                  Encaisser la facture
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];

  return (
    <main className="space-y-5">
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={status == "loading" || statusCustomer == "loading" || loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardBodyContent className="space-y-3">
        <h2 className="text-base font-semibold">Encaisser une facture</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          <DateRangePicker
            //@ts-ignore
            defaultDateRange={pickedDateRange}
            //@ts-ignore
            datesData={datesData}
            onDateRangeChange={(date) => {
              if (date.from && date.to) {
                handleDateRangeChange(date);
              }
            }}
          />
          <SelectPopover
            selectedItems={selectedSalespoint}
            items={salesPoints}
            onSelect={handleSelect}
            getOptionLabel={(el) => `${el.name} - ${el.address}`}
            placeholder="Points de vente"
          />
          <SelectPopover
            selectedItems={customer}
            items={customers}
            onSelect={handleSelectCustomers}
            getOptionLabel={(el) => `${el.name}`}
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
      </CardBodyContent>
      <CardBodyContent className="spaec-y-3">
        <h2 className="text-base font-semibold">Factures non encaissées</h2>
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
                placeholder="Filtrer par client..."
                value={
                  table?.getColumn("customer_name")?.getFilterValue() as string
                }
                onChange={(event) =>
                  table
                    ?.getColumn("customer_name")
                    ?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
              {/* <DropdownMenu>
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
              </DropdownMenu> */}
            </div>
          </div>
        </DataTableDemo>
      </CardBodyContent>
    </main>
  );
}
