import InvoicePDF from "@/app/pdf/invoiceA4Pdf";
import InvoiceSmallPDF from "@/app/pdf/invoiceSmallPDF";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BlobProvider } from "@react-pdf/renderer";
import React,
{ useState } from "react";
import BillDetails from "./BillDetails";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowDownToLine,
  Check,
  EllipsisVertical,
  EyeIcon,
  Pencil,
  Printer,
  Trash,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  CircularProgress,
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  DialogTitle as MuiDialogTitle,
  Dialog as MuiDialog,
  DialogContent as MuiDialogContent,
  DialogContentText,
  Button as MuiButton,
  DialogActions,
} from "@mui/material";

import ReactDOM from "react-dom/client";
import { deleteBill } from "../functions";
import { toast } from "@/components/ui/app-toast";
import { updateDeliverer } from "@/components/fetch";
import { usePermission } from "@/context/PermissionContext";
import { useTranslation } from "react-i18next";

import { AnimatePresence, motion } from "framer-motion"

export const ActionComponent = ({
  bill,
  employees,
  loading,
  onSetLoading,
  onGetData,
}: {
  bill: Bill;
  employees: Employee[];
  loading: boolean;
  onSetLoading: (el: boolean) => void;
  onGetData: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [openModalDelete, setOpenModalDelete] = React.useState(false);
  const [Muiopen, setMuiOpen] = React.useState(false);

  const { t: tCommon } = useTranslation("common");

  const handleClickOpen = () => {
    setMuiOpen(true);
  };

  const handleClose = (e?: { preventDefault: () => void; } | undefined) => {
    e?.preventDefault()
    setMuiOpen(false);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSetLoading(true);
    try {
      const formData = new FormData(event.currentTarget);
      const formJson = Object.fromEntries((formData as any).entries());
      const data = formJson?.employee > 0 ? formJson?.employee : null;
      const res = await updateDeliverer(bill?.id, data);
      if (res.status === 200) {
        toast({
          variant: "success",
          title: tCommon("success"),
          description: tCommon("invoice.success.received"),
          icon: <CheckCircle className="size-4" />,
        });
        onGetData();
        handleClose();
        onSetLoading(false);
      } else {
        toast({
          variant: "destructive",
          title: tCommon("error"),
          description: tCommon("errors.retry"),
          icon: <XCircle className="size-4" />,
        });
        onGetData();
        handleClose();
        onSetLoading(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: tCommon("error"),
        description: tCommon("errors.retry"),
        icon: <XCircle className="size-4" />,
      });
    }
  };

  const handleDeleteBill = async (id: number) => {
    try {
      const response = await deleteBill({ billId: id });
      await onGetData();
      if (response.status == 204) {
        toast({
          title: tCommon("success"),
          description: tCommon("invoice.success.deleted"),
          variant: "success",
          icon: <CheckCircle className="size-4" />,
        });
      } else {
        toast({
          title: tCommon("error"),
          description: tCommon("errors.retry"),
          variant: "destructive",
          icon: <XCircle className="size-4" />,
        });
      }
    } catch (error) {
      console.log(error);
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
  const { hasPermission, user, isAdmin } = usePermission()
  return (
    <>
      <AnimatePresence>
        {
          open &&
          <>
            <motion.div className="bg-black/40 backdrop-blur-md fixed inset-0 w-screen h-screen z-50 0top-0 right-0" />
            <motion.div
              initial={{
                opacity: 0.5,
                y: 50
              }}
              exit={{
                opacity: 0.5,
                y: 50
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className="h-screen w-screen overflow-auto p-5 z-50 fixed inset-0  flex justify-start items-center"
            >
              <BillDetails bill={bill} setClose={() => setOpen(false)} />
            </motion.div>
          </>
        }
      </AnimatePresence >
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
          {
            hasPermission('edit_invoice') ?
              <DropdownMenuItem onClick={() => setOpen(!open)}>
                <Pencil size={14} className="mr-3" />{tCommon("edit")}</DropdownMenuItem>
              : null
          }
          <DropdownMenuItem onClick={() => handleOpenPDF("large")}>
            {" "}
            <Printer className="mr-3" size={14} />{tCommon("actions.print_invoice")}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenPDF("small")}>
            {" "}
            <Printer className="mr-3" size={14} />{tCommon("actions.print_small")}</DropdownMenuItem>
          {
            hasPermission('receipt_bill') ? <DropdownMenuItem
              onClick={() => {
                handleClickOpen();
              }}
            >
              {" "}
              <ArrowDownToLine className="mr-3" size={14} />{tCommon("actions.receive")}</DropdownMenuItem> : null
          }
          {
            hasPermission('delete_bill') ? <DropdownMenuItem
              onClick={() => setOpenModalDelete(true)}
              className="text-red-500 hover:text-white hover:bg-red-600 "
            >
              {" "}
              <Trash className="mr-3" size={14} />{tCommon("delete")}</DropdownMenuItem> : null
          }
        </DropdownMenuContent>
      </DropdownMenu>
      <MuiDialog open={openModalDelete}>
        <MuiDialogTitle>
          {tCommon("dialogs.confirm_delete_invoice", { number: bill.bill_number })}
        </MuiDialogTitle>
        <MuiDialogContent>
          <DialogContentText>
            {tCommon("dialogs.delete_invoice_stock_return")}
          </DialogContentText>
          <h3 className="text-base font-medium text-red-400 mt-2">
            {tCommon("dialogs.irreversible_warning")}
          </h3>
        </MuiDialogContent>
        <DialogActions>
          <MuiButton color="success" onClick={() => setOpenModalDelete(false)}>{tCommon("common.no")}</MuiButton>
          <MuiButton color="error" onClick={() => handleDeleteBill(bill.id)}>{tCommon("common.yes")}</MuiButton>
        </DialogActions>
      </MuiDialog>
      <MuiDialog
        open={Muiopen}
        PaperProps={{
          component: "form",
          onSubmit: onSubmit,
        }}
      >
        <MuiDialogTitle>
          {tCommon("dialogs.confirm_receive_invoice", { number: bill?.bill_number })}
        </MuiDialogTitle>
        <MuiDialogContent>
          {/* <div className="max-w-sm"> */}
          {
            <>
              <DialogContentText>
                {tCommon("deliverer.select_then_validate")}
              </DialogContentText>
              <FormControl size="small" fullWidth sx={{ marginTop: 2 }}>
                <InputLabel size="small" id="demo-simple-select-label">
                  {tCommon("deliverer.select")}
                </InputLabel>
                <MuiSelect
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  required
                  fullWidth
                  name="employee"
                  size="small"
                  label={tCommon("deliverer.select")}
                >
                  {[
                    { id: 0, name: tCommon("none") },
                    ...employees.filter(
                      (employee) =>
                        employee.sales_point == bill?.sales_point &&
                        employee.is_deliverer == true
                    ),
                  ].map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </MenuItem>
                  ))}
                </MuiSelect>
              </FormControl>
            </>
          }
          {/* </div> */}
        </MuiDialogContent>
        <DialogActions>
          <Button
            variant={"destructive"}
            disabled={loading}
            onClick={handleClose}
          >{tCommon("cancel")}</Button>
          <Button
            variant="default"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 space-x-3"
            type="submit"
          >
            {loading && <CircularProgress size={14} color={"inherit"} />}
            {tCommon("actions.receive_invoice")}
          </Button>
        </DialogActions>
      </MuiDialog>
    </>
  );
};
