import InvoicePDF from "@/app/pdf/invoiceA4Pdf";
import InvoiceSmallPDF from "@/app/pdf/invoiceSmallPDF";
import {
  AlertDialogAction,
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Backdrop,
} from "@mui/material";

import ReactDOM from "react-dom/client";
import { useToast } from "@/components/ui/use-toast";
import { updateDeliverer } from "@/components/fetch";
import { check_warnings, receiptSupply } from "./functions";
import { cn } from "@/lib/utils";
import SupplyPdf from "@/app/pdf/supplyPdf";

export const ActionComponent = ({
  supply,
  onSetLoading,
  onGetData,
  page = "in_progress",
}: {
  supply: Supply;
  loading: boolean;
  onSetLoading: (el: boolean) => void;
  onGetData: () => void;
  page: "in_progress" | "history";
}) => {
  const [open, setOpen] = useState(false);
  const [openModalDelete, setOpenModalDelete] = React.useState(false);
  const [Muiopen, setMuiOpen] = React.useState(false);
  const [warnings, setWarnings] = React.useState(null);
  const [loadingState, setLoadingState] = useState(false);

  const { toast } = useToast();

  const check_warning = async ({ supplyId }: { supplyId: number }) => {
    try {
      setLoadingState(true);
      const res = await check_warnings({ supplyId });
      setWarnings(res);
      setMuiOpen(true);
      // console.log(Object.hasOwnProperty.call(res['warnings'], "balance"));
      console.log(
        res.warnings.some((warning: any) => warning.hasOwnProperty("balance"))
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingState(false);
    }
  };

  const handleReceiptSupply = async (supplyId: number) => {
    setLoadingState(true);
    try {
      const res = await receiptSupply({ supplyId });
      if (res) {
        toast({
          title: "Succès",
          description: `Facture créée avec succès`,
          variant: "destructive",
          className: "bg-green-800 border-green-800",
          icon: <Check className="mr-2" />,
        });
        onGetData();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Une erreur s'est produite lors de la reception de la commande`,
        variant: "destructive",
        className: "bg-red-800 border-red-800",
        icon: <Check className="mr-2" />,
      });
    } finally {
      setLoadingState(false);
    }
  };

  const handleClose = () => {
    setMuiOpen(false);
  };

  const handleOpenPDF = (format: "large" | "small" = "large") => {
    const newWindow = window.open("", "_blank");
    if (!newWindow) {
      alert("Failed to open a new tab. Please allow popups for this site.");
      return;
    }
    newWindow.document.write("<p>Loading PDF...</p>");
    const pdfBlobProvider = (
      <BlobProvider document={<SupplyPdf supply={supply} />}>
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
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loadingState && !warnings}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
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
            Imprimer le bon
          </DropdownMenuItem>
          {page == "in_progress" && (
            <DropdownMenuItem
              onClick={() => {
                check_warning({ supplyId: supply.id });
              }}
            >
              {" "}
              <ArrowDownToLine className="mr-3" size={14} />
              Receptionner
            </DropdownMenuItem>
          )}
          {page == "in_progress" && (
            <DropdownMenuItem
              onClick={() => setOpenModalDelete(true)}
              className="text-red-500 hover:text-white hover:bg-red-600 "
            >
              {" "}
              <Trash className="mr-3" size={14} />
              Supprimer
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <MuiDialog open={openModalDelete}>
        <MuiDialogTitle>
          Voulez-vous vraiment supprimer {supply.supply_number} ?
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
          {/* <MuiButton color="error" onClick={() => handleDeleteBill(bill.id)}>
            Oui
          </MuiButton> */}
        </DialogActions>
      </MuiDialog>
      <AlertDialog open={Muiopen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Voulez vous vraiment receptionnez cette commande ?
            </AlertDialogTitle>
            {warnings ? (
              // @ts-ignore
              warnings?.message ? (
                <AlertDialogDescription>
                  {/*  @ts-ignore */}
                  {warnings?.message}
                </AlertDialogDescription>
              ) : (
                warnings.warnings.map((warning) => {
                  const key = Object.keys(warning)[0];

                  return (
                    <AlertDialogDescription
                      key={key}
                      className={cn(
                        key == "balance" ? "text-red-500" : "text-neutral-800"
                      )}
                    >
                      - {Object.values(warning)[0]}
                    </AlertDialogDescription>
                  );
                })
              )
            ) : (
              <></>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant={"ghost"}
              className="border-red-500 border text-red-500 hover:bg-red-500 hover:text-white "
              onClick={handleClose}
            >
              Annuler
            </Button>
            <Button
              variant={"default"}
              color="success"
              //@ts-ignore
              disabled={
                warnings?.warnings?.some((warning: any) =>
                  warning.hasOwnProperty("balance")
                ) || loadingState
              }
              onClick={() => handleReceiptSupply(supply.id)}
            >
              {loadingState && warnings
                ? "Veuillez patienter..."
                : "Receptionner"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
