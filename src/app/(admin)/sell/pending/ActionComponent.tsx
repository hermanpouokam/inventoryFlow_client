import InvoicePDF from "@/app/pdf/invoiceA4Pdf";
import InvoiceSmallPDF from "@/app/pdf/invoiceSmallPDF";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BlobProvider } from "@react-pdf/renderer";
import React, { useState } from "react";
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
  Printer,
  Trash,
  X,
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
import { useToast } from "@/components/ui/use-toast";
import { updateDeliverer } from "@/components/fetch";

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

  const { toast } = useToast();

  const handleClickOpen = () => {
    setMuiOpen(true);
  };

  const handleClose = () => {
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
          variant: "default",
          className:
            "bg-green-600 border-green-600 text-white text-base font-semibold",
          title: "Succès",
          description: "Facture receptionnée avec succès",
          icon: <Check className="mr-2" />,
        });
        onGetData();
        handleClose();
        onSetLoading(false);
      } else {
        toast({
          variant: "destructive",
          className:
            "bg-red-600 border-red-600 text-white text-base font-semibold",
          title: "Erreur",
          description: "Une erreur est survenue veuillez reessayer.",
          icon: <X className="mr-2" />,
        });
        onGetData();
        handleClose();
        onSetLoading(false);
      }
    } catch (error) {
      toast({
        variant: "default",
        className:
          "bg-red-600 border-red-600 text-white text-base font-semibold",
        title: "Erreur",
        description: "Une erreur est survenue veuillez reessayer.",
        icon: <X className="mr-2" />,
      });
    }
  };

  const handleDeleteBill = async (id: number) => {
    try {
      const response = await deleteBill({ billId: id });
      await onGetData();
      if (response.status == 204) {
        toast({
          title: "Succès",
          description: `Facture supprimée avec succès`,
          variant: "success",
          className: "bg-green-600 border-green-600",
          icon: <Check className="mr-2" />,
        });
      } else {
        toast({
          title: "Erreur",
          description: `Une erreur est survenu veuillez réessayer`,
          variant: "destructive",
          className: "bg-red-600 border-red-600",
          icon: <Check className="mr-2" />,
        });
      }
    } catch (error) {
      console.log(error);
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
          <DropdownMenuItem onClick={() => setOpen(!open)}>
            <EyeIcon size={14} className="mr-3" />
            Voir les details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenPDF("large")}>
            {" "}
            <Printer className="mr-3" size={14} />
            Imprimer la facture
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenPDF("small")}>
            {" "}
            <Printer className="mr-3" size={14} />
            Imprimer en petit format
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              handleClickOpen();
            }}
          >
            {" "}
            <ArrowDownToLine className="mr-3" size={14} />
            Receptionner
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpenModalDelete(true)}
            className="text-red-500 hover:text-white hover:bg-red-600 "
          >
            {" "}
            <Trash className="mr-3" size={14} />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <MuiDialog open={openModalDelete}>
        <MuiDialogTitle>
          Voulez-vous vraiment supprimer {bill.bill_number} ?
        </MuiDialogTitle>
        <MuiDialogContent>
          <DialogContentText>
            Vous allez supprimer definitivement cette facture. tous articles
            disponibles retourneront dans votre stock.
          </DialogContentText>
          <h3 className="text-base font-medium text-red-400 mt-2">
            NB: Cette action est irreversible
          </h3>
        </MuiDialogContent>
        <DialogActions>
          <MuiButton color="success" onClick={() => setOpenModalDelete(false)}>
            Non
          </MuiButton>
          <MuiButton color="error" onClick={() => handleDeleteBill(bill.id)}>
            Oui
          </MuiButton>
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
          Voulez-vous vraiment receptionner {bill?.bill_number} ?
        </MuiDialogTitle>
        <MuiDialogContent>
          {/* <div className="max-w-sm"> */}
          {
            <>
              <DialogContentText>
                Selectionner un livreur puis validez
              </DialogContentText>
              <FormControl size="small" fullWidth sx={{ marginTop: 2 }}>
                <InputLabel size="small" id="demo-simple-select-label">
                  Seletionner un livreur
                </InputLabel>
                <MuiSelect
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  required
                  fullWidth
                  name="employee"
                  size="small"
                  label="Seletionner un livreur"
                >
                  {[
                    { id: 0, name: "Aucun" },
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
          >
            Annuler
          </Button>
          <Button
            variant="default"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 space-x-3"
            type="submit"
          >
            {loading && <CircularProgress size={14} color={"inherit"} />}
            Receptionner la facture
          </Button>
        </DialogActions>
      </MuiDialog>
    </>
  );
};
