"use client";
import CardBodyContent from "@/components/CardContent";
import {
  DataTableDemo
} from "@/components/TableComponent";
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
import {
  AppDispatch,
  RootState
} from "@/redux/store";
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
  PrinterIcon,
  WalletCards,
  X,
  XCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import moment from "moment";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import BillDetails from "../pending/BillDetails";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef, Row } from "@tanstack/react-table";
import { formatteCurrency } from "../../stock/functions";
import { instance, updatePaid } from "@/components/fetch";
import { toast } from "@/components/ui/app-toast";
import { fetchClients } from "@/redux/clients";
import SelectPopover from "@/components/SelectPopover";
import { getBill } from "../functions";
import InvoicePDF from "@/app/pdf/invoiceA4Pdf";
import InvoiceSmallPDF from "@/app/pdf/invoiceSmallPDF";
import { BlobProvider } from "@react-pdf/renderer";
import ReactDOM from "react-dom/client";
import { usePermission } from "@/context/PermissionContext";
import { useTranslation } from "react-i18next";
import { DateRangePicker } from "@/components/DateRangePicker";

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
  const [text, setText] = React.useState<string>("");
  const dispatch: AppDispatch = useDispatch();
  const {
    data: salesPoints,
    status,
    error,
  } = useSelector((state: RootState) => state.salesPoints);
  const { t: tCommon } = useTranslation("common")
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
        customer: customer.map((el) => el.id),
        start_date: moment(pickedDateRange?.from).format(
          "YYYY-MM-DDT00:00:00.SSS"
        ),
        end_date: moment(pickedDateRange?.to).format("YYYY-MM-DDT23:59:59.SSS"),
        sales_point: isAdmin()
          ? selectedSalespoint.map((el) => el.id)
          : [user?.sales_point],
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

    // ── Gestion du paiement via solde client ──────────────────────────────
    const [reduceFromBalance, setReduceFromBalance] = React.useState(false);
    const [checkingBalance, setCheckingBalance] = React.useState(false);
    const [balanceCheck, setBalanceCheck] = React.useState<{
      sufficient: boolean;
      message: string;
      data: {
        client_balance: string;
        amount: string;
        remaining_balance_after_purchase?: string;
        amount_payable_from_balance?: string;
        remaining_debt?: string;
      };
    } | null>(null);

    const checkClientBalance = async () => {
      if (!bill.customer) return;
      setCheckingBalance(true);
      try {
        const res = await instance.post(
          `/clients/${bill.customer}/check-balance/`,
          { amount: bill.total_amount_with_taxes_fees },
          { withCredentials: true }
        );
        setBalanceCheck(res.data);
      } catch (error: any) {
        toast({
          title: tCommon("error"),
          description:
            error.response?.data?.error ?? tCommon("errors.retry"),
          variant: "destructive",
          icon: <XCircle className="size-4" />,
        });
        setBalanceCheck(null);
        setReduceFromBalance(false);
      } finally {
        setCheckingBalance(false);
      }
    };

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
            title: tCommon("success"),
            description:
              response.data.success ?? tCommon("packaging_return.success"),
            icon: <CheckCircle className="size-4" />,
            variant: "success",
          });
        }
      } catch (error: any) {
        return toast({
          title: tCommon("error"),
          description:
            error.response?.data?.error ??
            tCommon("errors.check_connection"),
          icon: <XCircle className="size-4" />,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      try {
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries((formData as any).entries());
        const { paid_amount, bill_id } = formJson;

        // Si on paie via le solde client, on bloque si le solde est
        // insuffisant ET que l'utilisateur n'a pas confirmé le passage
        // en dette pour le reste.
        const response = await instance.put(
          `/bills/${bill_id}/update-delivered/`,
          {
            amount: reduceFromBalance ? 0 : paid_amount,
            reduce_from_balance: reduceFromBalance,
          },
          { withCredentials: true }
        );

        if (response?.data.detail) {
          toast({
            variant: "success",
            title: tCommon("success"),
            description: tCommon("receipt.success.collected"),
            icon: <CheckCircle className="size-4" />,
          });
          dispatch(fetchBills({ state: "pending" }));
          setOpenPopup(false);
          setReduceFromBalance(false);
          setBalanceCheck(null);
        }
      } catch (error: any) {
        toast({
          title: tCommon("error"),
          description:
            error.response?.data?.detail ??
            tCommon("errors.retry"),
          variant: "destructive",
          icon: <XCircle className="size-4" />,
        });
      } finally {
        setLoading(false);
      }
      await getData();
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
        setReduceFromBalance(false);
        setBalanceCheck(null);
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
              {tCommon("receipt.dialogs.collect_title", { number: bill.bill_number })}
            </MuiDialogTitle>
            <MuiDialogContent
              className="max-w-md"
            >
              <DialogContentText>
                {tCommon("receipt.dialogs.collect_description")}
              </DialogContentText>
              <div className="mt-2"></div>
              <TextField
                autoFocus
                required
                margin="dense"
                name="total_amount"
                label={tCommon("total_amount")}
                value={bill.total_amount_with_taxes_fees}
                type="number"
                size="small"
                fullWidth
                disabled
              />
              <TextField
                required={!reduceFromBalance}
                disabled={reduceFromBalance}
                margin="dense"
                name="paid_amount"
                label={tCommon("receipt.paid_amount")}
                type="number"
                size="small"
                defaultValue={bill.total_amount_with_taxes_fees}
                fullWidth
              />
              <input type="text" hidden={true} name="bill_id" value={bill.id} />

              {/* ── Paiement via le solde du compte client ───────────────── */}
              {bill.customer ? (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`reduce_from_balance_${bill.id}`}
                      checked={reduceFromBalance}
                      onCheckedChange={(checked) => {
                        const isChecked = !!checked;
                        setReduceFromBalance(isChecked);
                        setBalanceCheck(null);
                        if (isChecked) {
                          checkClientBalance();
                        }
                      }}
                    />
                    <label
                      htmlFor={`reduce_from_balance_${bill.id}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {tCommon("receipt.deduct_from_client_balance")}
                    </label>
                  </div>

                  {checkingBalance && (
                    <p className="text-sm text-muted-foreground">
                      {tCommon("loading")}...
                    </p>
                  )}

                  {reduceFromBalance && balanceCheck && (
                    <div
                      className={cn(
                        "flex items-start gap-2 text-sm rounded-md p-2",
                        balanceCheck.sufficient
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      )}
                    >
                      {balanceCheck.sufficient ? (
                        <CheckCircle className="size-4 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                      )}
                      <div>
                        {balanceCheck.sufficient ? (
                          <p>
                            {tCommon("receipt.balance_sufficient", {
                              balance: formatteCurrency(
                                Number(balanceCheck.data.client_balance)
                              ),
                            })}
                          </p>
                        ) : (
                          <>
                            <p>
                              {tCommon("receipt.balance_insufficient", {
                                balance: formatteCurrency(
                                  Number(balanceCheck.data.client_balance)
                                ),
                                amount: formatteCurrency(
                                  Number(balanceCheck.data.amount)
                                ),
                              })}
                            </p>
                            <p className="mt-1">
                              {tCommon("receipt.balance_remaining_as_debt", {
                                debt: formatteCurrency(
                                  Number(balanceCheck.data.remaining_debt)
                                ),
                              })}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </MuiDialogContent>
            <DialogActions>
              <MuiButton disabled={loading} onClick={handleClose} color="error">
                {tCommon("cancel")}
              </MuiButton>
              <MuiButton
                disabled={loading || (reduceFromBalance && checkingBalance)}
                type="submit"
                color="success"
              >
                {loading ? tCommon("please wait") : tCommon("receipt.actions.collect")}
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
              {tCommon("dialogs.packaging_return_invoice", { number: bill.bill_number })}
            </MuiDialogTitle>
            <MuiDialogContent>
              <div className="space-y-3">
                <p className="font-medium text-base">
                  {tCommon("packaging_return.items_intro")}
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
                {tCommon("cancel")}
              </MuiButton>
              <MuiButton
                disabled={loading || product_bill_ids.length < 1}
                onClick={handleClick}
                color="success"
              >
                {loading ? tCommon("please wait") : tCommon("confirm")}
              </MuiButton>
            </DialogActions>
          </MuiDialog>
        );
      }
    };

    const handleOpenPDF = (format: "large" | "small" = "large") => {
      const newWindow = window.open("", "_blank");
      if (!newWindow) {
        alert(tCommon("popup_blocked"));
        return;
      }
      newWindow.document.write(`<p>${tCommon("loading_pdf")}</p>`);
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
                  {tCommon("close")}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{tCommon("open_menu")}</span>
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{tCommon("actions.title")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleOpenPDF("large")}>
              <PrinterIcon size={14} className="mr-3" />
              {tCommon("receipt.actions.print_a4")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenPDF("small")}>
              <PrinterIcon size={14} className="mr-3" />
              {tCommon("receipt.actions.print_small")}
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
                {tCommon("actions.packaging_return")}
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
              {tCommon("receipt.actions.collect_invoice")}
            </DropdownMenuItem> : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  };

  const tCol = (key: string) => tCommon(`bills.columns.${key}`);

  const columns = React.useMemo<ColumnDef<Bill>[]>(() => [
    {
      accessorKey: "number",
      header: () => (
        <div className="w-[20px] text-center">
          {"#"}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("number")}</div>
      ),
    },

    {
      id: "actions",
      enableHiding: false,
      header: () => (
        <div className="text-left w-[50px]">
          {tCol("actions")}
        </div>
      ),
      cell: ({ row }) => <ActionComponent row={row} />,
    },

    {
      accessorKey: "bill_number",
      header: () => (
        <div className="text-left w-[140px]">
          {tCol("bill_number")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="capitalize">
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
              {tCol("sales_point")}
            </div>
          ),
          cell: ({ row }: { row: Row<Bill> }) => (
            <div className="text-center capitalize truncate">
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
          className="text-center cursor-pointer w-[220px]"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          {tCol("customer_name")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="capitalize text-center text-base font-medium">
          {row.original.customer_name}
        </div>
      ),
      footer: () => <div className="text-right">{tCol("total")}</div>,
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
          <span>{tCol("packages_count")}</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center w-[100px]">
          {row.original.product_bills.reduce(
            (acc, curr) => acc + curr.quantity,
            0
          )}
        </div>
      ),
      footer: () => {
        const totalQty = data.reduce((total, bill) => {
          return (
            total +
            bill.product_bills.reduce(
              (subtotal, pb) => subtotal + pb.quantity,
              0
            )
          );
        }, 0);

        return <div className="text-center">{totalQty}</div>;
      },
    },

    {
      accessorKey: "amount",
      header: () => (
        <h6 className="text-center w-[220px]">
          {tCol("amount")}
        </h6>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {formatteCurrency(row.original.total_amount)}
        </div>
      ),
    },

    {
      accessorKey: "created_at",
      header: () => (
        <div className="text-center w-[240px]">
          {tCol("created_at")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {new Intl.DateTimeFormat('fr-FR', {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }).format(new Date(row.getValue("created_at")))}
        </div>
      ),
    },
  ], [data]);

  return (
    <React.Suspense fallback={<div>{tCommon("loading")}</div>}>
      <main className="space-y-5">
        <Backdrop
          sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={status == "loading" || statusCustomer == "loading" || loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        <CardBodyContent className="space-y-3">
          <h2 className="text-base font-semibold">
            {tCommon("billing.collect_invoice")}
          </h2>

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

            {isAdmin() ? (
              <SelectPopover
                selectedItems={selectedSalespoint}
                items={salesPoints}
                onSelect={handleSelect}
                getOptionLabel={(el) => `${el.name} - ${el.address}`}
                placeholder={tCommon("sales.points")}
                noItemText={tCommon("sales.no_points")}
                searchPlaceholder={tCommon("sales.search_point")}
              />
            ) : null}

            <SelectPopover
              selectedItems={customer}
              items={customers}
              onSelect={handleSelectCustomers}
              getOptionLabel={(el) => `${el.name}`}
              placeholder={tCommon("customers.title")}
              noItemText={tCommon("customers.empty")}
              searchPlaceholder={tCommon("customers.search")}
            />

            <Button
              variant={"primary"}
              onClick={getData}
              className={cn("w-full bg-indigo-800 hover:bg-indigo-600")}
            >
              {tCommon("search.action")}
            </Button>
          </div>
        </CardBodyContent>

        <CardBodyContent className="spaec-y-3">
          <h2 className="text-base font-semibold">
            {tCommon("billing.unpaid_invoices")}
          </h2>

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
                  placeholder={tCommon("customers.filter_placeholder")}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  className="max-w-md"
                />
              </div>
            </div>
          </DataTableDemo>
        </CardBodyContent>
      </main>
    </React.Suspense>
  );
}