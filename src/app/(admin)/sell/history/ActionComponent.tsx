import InvoicePDF from "@/app/pdf/invoiceA4Pdf";
import InvoiceSmallPDF from "@/app/pdf/invoiceSmallPDF";
import { instance } from "@/components/fetch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { encryptParam } from "@/utils/encryptURL";
import { BlobProvider } from "@react-pdf/renderer";
import {
  ArrowDownToLine,
  Check,
  EllipsisVertical,
  EyeIcon,
  Printer,
  X,
} from "lucide-react";
import React from "react";
import ReactDOM from "react-dom/client";
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
import { Checkbox } from "@/components/ui/checkbox";

export const ActionComponent = ({
  bill,
  onGetData,
  onSetLoading,
  loading,
}: {
  bill: Bill;
  onGetData: () => void;
  onSetLoading: (e: boolean) => void;
  loading: boolean;
}) => {
  const encryptedURl = encryptParam(`${bill.id}`);

  const handleNavigate = () => {
    return window.location.assign(`/sell/${encryptedURl}`);
  };

  const { toast } = useToast();
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

  const [openPopup, setOpenPopup] = React.useState(false);
  const [product_bill_ids, setProduct_bill_ids] = React.useState<number[]>([]);

  const handleClose = () => {
    setOpenPopup(false);
  };
  const handleClick = async () => {
    onSetLoading(true);
    try {
      const response = await instance.post(
        `/bills/${bill.id}/retour_emballage/`,
        { product_bill_ids },
        { withCredentials: true }
      );
      if (response.status === 200) {
        onGetData();
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
      onSetLoading(false);
    }
  };

  return (
    <>
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
          <DropdownMenuItem onClick={handleNavigate}>
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
          {bill.product_bills.some((pb) => pb.record_package > 0) &&
          bill.state != "created" ? (
            <DropdownMenuItem
              onClick={() => {
                setOpenPopup(true);
              }}
            >
              {" "}
              <ArrowDownToLine className="mr-3" size={14} />
              Retour d&apos;emballage
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <MuiDialog open={openPopup}>
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
                          ? setProduct_bill_ids([...product_bill_ids, pb.id])
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
                      {pb.product_details.name} {" => "} {pb.record_package}
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
    </>
  );
};
