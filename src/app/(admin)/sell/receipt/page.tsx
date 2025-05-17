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
  PrinterIcon,
  WalletCards,
  X,
} from "lucide-react";
import moment from "moment";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import BillDetails from "../pending/BillDetails";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef, Row } from "@tanstack/react-table";
import { formatteCurrency } from "../../stock/functions";
import { instance, updatePaid } from "@/components/fetch";
import { useToast } from "@/components/ui/use-toast";
import { fetchClients } from "@/redux/clients";
import SelectPopover from "@/components/SelectPopover";
import { getBill } from "../functions";
import InvoicePDF from "@/app/pdf/invoiceA4Pdf";
import InvoiceSmallPDF from "@/app/pdf/invoiceSmallPDF";
import { BlobProvider } from "@react-pdf/renderer";
import ReactDOM from "react-dom/client";
import { usePermission } from "@/context/PermissionContext";

export default function Page() {
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
  const [text, setText] = React.useState<sting>("");
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
        customer: customer.map(el => el.id),
        start_date: moment(pickedDateRange?.from).format(
          "YYYY-MM-DDT00:00:00.SSS"
        ),
        end_date: moment(pickedDateRange?.to).format("YYYY-MM-DDT23:59:59.SSS"),
        sales_point: isAdmin() ? selectedSalespoint : [user?.sales_point],
      };
      //@ts-ignore
      const res: Bill[] = await getBill(params);
      setdata(res.filter((el) => el.state == "pending"));
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  const { user, hasPermission, isAdmin } = usePermission()
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
          icon: <Check className="mr-2" />,
        });
        dispatch(fetchBills({ state: "pending" }));
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error.response.data.detail ??
          `Une erreur est survenu veuillez réessayer`,
        variant: "destructive",
        className: "bg-red-500 border-red-500",
        icon: <X className="mr-2" />,
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

  const ActionComponent = ({ row }: { row: any }) => {
    const bill: Bill = row.original;
    const [open, setOpen] = React.useState(false);
    const [openPopup, setOpenPopup] = React.useState(false);
    const [type, setType] = React.useState<"receipt" | "record">("receipt");

    const [product_bill_ids, setProduct_bill_ids] = React.useState<number[]>(
      []
    );

    const handleClick = async () => {
      setLoading(true);
      try {
        const response = await instance.post(
          `/bills/${bill.id}/retour_emballage/`,
          { product_bill_ids },
          { withCredentials: true }
        );
        if (response.status === 200) {
          getData();
          return toast({
            title: "Succès",
            description:
              response.data.success ?? "Retour emballage effectué avec succès",
            icon: <Check className="mr-2" />,
            variant: "default",
            className: "bg-green-600 border-green-600 text-white",
          });
        }
      } catch (error) {
        return toast({
          title: "Erreur",
          description:
            error.response.data.error ??
            "Une erreur est survenue. verifiez votre connexion et ressayez",
          icon: <X className="mr-2" />,
          variant: "destructive",
          className: "bg-red-600 border-red-600 text-white",
        });
      } finally {
        setLoading(false);
      }
    };

    const PopUp = ({
      isOpen,
      type,
    }: {
      isOpen: boolean;
      type: "receipt" | "record";
    }) => {
      const handleClose = () => {
        setOpenPopup(false);
      };

      if (type == "receipt") {
        return (
          <MuiDialog
            open={isOpen}
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
              <input type="text" hidden={true} name="bill_id" value={bill.id} />
            </MuiDialogContent>
            <DialogActions>
              <MuiButton disabled={loading} onClick={handleClose} color="error">
                Annuler
              </MuiButton>
              <MuiButton disabled={loading} type="submit" color="success">
                {loading ? "Veuillez patienter..." : "Encaisser"}
              </MuiButton>
            </DialogActions>
          </MuiDialog>
        );
      } else if (type == "record") {
        return (
          <MuiDialog
            open={isOpen}
            PaperProps={{
              component: "form",
              onSubmit: onSubmit,
            }}
          >
            <MuiDialogTitle>
              Retour d&apos;emballage de la facture {bill.bill_number}
            </MuiDialogTitle>
            <MuiDialogContent>
              <div className="space-y-3">
                <p className="text-sm text-orange-500">
                  NB: Le montant des emballages retournés sera automatiquement
                  deduit de la caisse et reversé dans le solde du client
                </p>
                <p className="font-medium text-base">
                  Vous allez effetuer le retour des emballages suivants
                </p>
                <div className="space-y-2 pl-2">
                  {bill.product_bills.map((pb) => {
                    return (
                      <div className="flex items-center space-x-2" key={pb.id}>
                        <Checkbox
                          // value={pb.id}
                          checked={product_bill_ids.includes(pb.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? setProduct_bill_ids([
                                ...product_bill_ids,
                                pb.id,
                              ])
                              : setProduct_bill_ids((items) => {
                                return items.filter((item) => item !== pb.id);
                              });
                          }}
                          id={`product-${pb.id}`}
                        />
                        <label
                          htmlFor={`product-${pb.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {pb.product_details.name} {"=>"} {pb.record_package}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </MuiDialogContent>
            <DialogActions>
              <MuiButton disabled={loading} onClick={handleClose} color="error">
                Annuler
              </MuiButton>
              <MuiButton
                disabled={loading || product_bill_ids.length < 1}
                onClick={handleClick}
                color="success"
              >
                {loading ? "Veuillez patienter..." : "Confirmer"}
              </MuiButton>
            </DialogActions>
          </MuiDialog>
        );
      }
    };

    const handleOpenPDF = (format: "large" | "small" = "large") => {
      const newWindow = window.open("", "_blank");
      if (!newWindow) {
        alert("Failed to open a new tab. Please allow popups for this site.");
        return;
      }
      newWindow.document.write("<p>Loading PDF...</p>");
      const pdfBlobProvider = (
        <BlobProvider
          document={
            format == "large" ? (
              <InvoicePDF bill={bill} />
            ) : (
              <InvoiceSmallPDF bill={bill} />
            )
          }
        >
          {/* @ts-ignore */}
          {({ blob }) => {
            console.log("blob", blob);
            if (blob) {
              const blobUrl = URL.createObjectURL(blob);
              newWindow.location.href = blobUrl; // Redirect the popup to the blob URL
            } else {
              newWindow.document.write("<p>Failed to load the PDF.</p>");
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
      <>
        <PopUp isOpen={openPopup} type={type} />
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
            <DropdownMenuItem onClick={() => handleOpenPDF("large")}>
              <PrinterIcon size={14} className="mr-3" />
              Imprimer en A4
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenPDF("small")}>
              <PrinterIcon size={14} className="mr-3" />
              Imprimer en petit format
            </DropdownMenuItem>
            {bill.product_bills.some((pb) => pb.record_package > 0) && hasPermission('back_packaging') ? (
              <DropdownMenuItem
                onClick={() => {
                  setOpenPopup(true);
                  setType("record");
                }}
              >
                {" "}
                <ArrowDownToLine className="mr-3" size={14} />
                Retour d&apos;emballage
              </DropdownMenuItem>
            ) : null}
            {hasPermission('cash_in_invoices') ? <DropdownMenuItem
              onClick={() => {
                setOpenPopup(true);
                setType("receipt");
              }}
            >
              {" "}
              <WalletCards className="mr-3" size={14} />
              Encaisser la facture
            </DropdownMenuItem> : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  };

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
    ...(isAdmin() ? [{
      accessorKey: "Point de vente",
      header: () => <div className="text-center w-[220px]">Point de vente</div>,
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
      accessorKey: "nombre de colis",
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
        return (
          <div className="capitalize text-center  w-[100px]">
            {row.original.product_bills.reduce(
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
          <h6 className="text-right text-base w-[220px]">Montant</h6>
        </div>
      ),
      cell: ({ row }) => {
        const formatted = formatteCurrency(
          row.original.total_amount,
          "XAF",
          "fr-FR"
        );
        return <div className="text-right font-medium">{formatted}</div>;
      },
      footer: () => {
        const totalAmount = data.reduce((total, bill) => {
          return (total += bill.total_amount);
        }, 0);
        const formatted = formatteCurrency(totalAmount, "XAF", "fr-FR");
        return <div className="text-right">{formatted}</div>;
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
      header: () => (
        <div>
          <h6 className="text-right text-base w-[220px]">Montant total</h6>
        </div>
      ),
      cell: ({ row }) => {
        const formatted = formatteCurrency(
          row.original.total_amount_with_taxes_fees,
          "XAF",
          "fr-FR"
        );
        return <div className="text-right font-medium">{formatted}</div>;
      },
      footer: () => {
        const totalAmount = data.reduce((total, bill) => {
          return (total += bill.total_amount_with_taxes_fees);
        }, 0);
        const formatted = formatteCurrency(totalAmount, "XAF", "fr-FR");
        return <div className="text-right">{formatted}</div>;
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
      cell: ({ row }) => <ActionComponent row={row} />,
    },
  ];

  return (
    <React.Suspense fallback={<div>Veuillez patienter</div>}>
      <main className="space-y-5">
        <Backdrop
          sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={status == "loading" || statusCustomer == "loading" || loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <CardBodyContent className="space-y-3">
          <h2 className="text-base font-semibold">Encaisser une facture</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
            {
              isAdmin() ?
                <SelectPopover
                  selectedItems={selectedSalespoint}
                  items={salesPoints}
                  onSelect={handleSelect}
                  getOptionLabel={(el) => `${el.name} - ${el.address}`}
                  placeholder="Points de vente"
                  noItemText="Aucun point de vente"
                  searchPlaceholder="Rechercher un point de vente"
                />
                : null
            }
            <SelectPopover
              selectedItems={customer}
              items={customers}
              onSelect={handleSelectCustomers}
              getOptionLabel={(el) => `${el.name}`}
              placeholder="Clients"
              noItemText="Aucun client"
              searchPlaceholder="Rechercher un client"
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
            filterAttributes={["bill_number", "customer_name"]}
            searchText={text}
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
                  value={text}
                  onChange={(event) => setText(event.target.value)}
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
    </React.Suspense>
  );
}
