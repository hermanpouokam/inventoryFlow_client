// import InvoicePDF from "@/app/pdf/invoiceA4Pdf";
// import InvoiceSmallPDF from "@/app/pdf/invoiceSmallPDF";
// import {
  // instance } from "@/components/fetch";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
  // DropdownMenuContent,
  // DropdownMenuItem,
  // DropdownMenuLabel,
  // DropdownMenuSeparator,
  // DropdownMenuTrigger,
  // } from "@/components/ui/dropdown-menu";
// import { toast } from "@/components/ui/app-toast";
// import { encryptParam } from "@/utils/encryptURL";
// import { BlobProvider } from "@react-pdf/renderer";
// import {
//   ArrowDownToLine,
  // Check,
  // EllipsisVertical,
  // EyeIcon,
  // Printer,
  // X,
  // XCircle,
  //,
// import React from "react";
// import ReactDOM from "react-dom/client";
// import {
//   DialogActions,
//   Dialog as MuiDialog,
//   DialogContent as MuiDialogContent,
//   DialogTitle as MuiDialogTitle,
//   Button as MuiButton,
// } from "@mui/material";
// import { Checkbox } from "@/components/ui/checkbox";
// import { useTranslation } from "react-i18next";

// export const ActionComponent = ({
//   bill,
//   onGetData,
//   onSetLoading,
//   loading,
// }: {
//   bill: Bill;
//   onGetData: () => void;
//   onSetLoading: (e: boolean) => void;
//   loading: boolean;
// }) => {
//   const encryptedURl = encryptParam(`${bill.id}`);

//   const handleNavigate = () => {
//     return window.location.assign(`/sell/${encryptedURl}`);
//   };

//   const { t: tCommon } = useTranslation("common");
//   const handleOpenPDF = (format: "large" | "small" = "large") => {
//     const newWindow = window.open("", "_blank");
//     if (!newWindow) {
//       alert(tCommon("popup_blocked"));
//       return;
//     }
//     newWindow.document.write(`<p>${tCommon("loading_pdf")}</p>`);
//     const pdfBlobProvider = (
//       <BlobProvider
//         document={
//           format == "large" ? (
//             <InvoicePDF bill={bill} />
//           ) : (
//             <InvoiceSmallPDF bill={bill} />
//           )
//         }
//       >
//         {/* @ts-ignore */}
//         {({ blob }) => {
//           console.log("blob", blob);
//           if (blob) {
//             const blobUrl = URL.createObjectURL(blob);
//             newWindow.location.href = blobUrl; // Redirect the popup to the blob URL
//           } else {
//             newWindow.document.write(`<p>${tCommon("pdf_error")}</p>`);
//           }
//         }}
//       </BlobProvider>
//     );
//     const container = document.createElement("div");
//     document.body.appendChild(container);
//     const root = ReactDOM.createRoot(container);
//     root.render(pdfBlobProvider);
//   };

//   const [openPopup, setOpenPopup] = React.useState(false);
//   const [product_bill_ids, setProduct_bill_ids] = React.useState<number[]>([]);

//   const handleClose = () => {
//     setOpenPopup(false);
//   };
//   const handleClick = async () => {
//     onSetLoading(true);
//     try {
//       const response = await instance.post(
//         `/bills/${bill.id}/retour_emballage/`,
//         { product_bill_ids },
//         { withCredentials: true }
//       );
//       if (response.status === 200) {
//         onGetData();
//         return toast({
//           title: tCommon("success"),
//           description:
//             response.data.success ?? tCommon("packaging_return.success"),
//           icon: <Check className="mr-2" />,
//           variant: "default",
//         });
//       }
//     } catch (error) {
//       return toast({
//         title: tCommon("error"),
//         description:
//           error.response.data.error ??
//           tCommon("errors.check_connection"),
//         icon: <XCircle className="size-4" />,
//         variant: "destructive",
//       });
//     } finally {
//       onSetLoading(false);
//     }
//   };

//   return (
//     <>
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button variant="ghost" className="h-8 w-8 p-0">
//             <span className="sr-only">{tCommon("open_menu")}</span>
//             <EllipsisVertical className="h-4 w-4" />
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent align="end">
//           <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
//           <DropdownMenuSeparator />
//           <DropdownMenuItem onClick={handleNavigate}>
//             <EyeIcon size={14} className="mr-3" />{tCommon("actions.view_details")}</DropdownMenuItem>

//           <DropdownMenuItem onClick={() => handleOpenPDF("large")}>
//             {" "}
//             <Printer className="mr-3" size={14} />{tCommon("actions.print_invoice")}</DropdownMenuItem>
//           <DropdownMenuItem onClick={() => handleOpenPDF("small")}>
//             {" "}
//             <Printer className="mr-3" size={14} />{tCommon("actions.print_small")}</DropdownMenuItem>
//           {bill.product_bills.some((pb) => pb.record_package > 0) &&
//           bill.state != "created" ? (
//             <DropdownMenuItem
//               onClick={() => {
//                 setOpenPopup(true);
//               }}
//             >
//               {" "}
//               <ArrowDownToLine className="mr-3" size={14} />
//               {tCommon("actions.packaging_return")}
//             </DropdownMenuItem>
//           ) : null}
//         </DropdownMenuContent>
//       </DropdownMenu>
//       <MuiDialog open={openPopup}>
//         <MuiDialogTitle>
//           {tCommon("dialogs.packaging_return_invoice", { number: bill.bill_number })}
//         </MuiDialogTitle>
//         <MuiDialogContent>
//           <div className="space-y-3">
//             <p className="text-sm text-orange-500">
//               {tCommon("packaging_return.cash_note")}
//             </p>
//             <p className="font-medium text-base">
//               {tCommon("packaging_return.items_intro")}
//             </p>
//             <div className="space-y-2 pl-2">
//               {bill.product_bills.map((pb) => {
//                 return (
//                   <div className="flex items-center space-x-2" key={pb.id}>
//                     <Checkbox
//                       // value={pb.id}
//                       checked={product_bill_ids.includes(pb.id)}
//                       onCheckedChange={(checked) => {
//                         return checked
//                           ? setProduct_bill_ids([...product_bill_ids, pb.id])
//                           : setProduct_bill_ids((items) => {
//                               return items.filter((item) => item !== pb.id);
//                             });
//                       }}
//                       id={`product-${pb.id}`}
//                     />
//                     <label
//                       htmlFor={`product-${pb.id}`}
//                       className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                     >
//                       {pb.product_details.name} {" => "} {pb.record_package}
//                     </label>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </MuiDialogContent>
//         <DialogActions>
//           <MuiButton disabled={loading} onClick={handleClose} color="error">{tCommon("cancel")}</MuiButton>
//           <MuiButton
//             disabled={loading || product_bill_ids.length < 1}
//             onClick={handleClick}
//             color="success"
//           >
//             {loading ? tCommon("please wait") : tCommon("supplier.actions.confirm")}
//           </MuiButton>
//         </DialogActions>
//       </MuiDialog>
//     </>
//   );
// };


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
import { toast } from "@/components/ui/app-toast";
import { encryptParam } from "@/utils/encryptURL";
import { BlobProvider } from "@react-pdf/renderer";
import {
  ArrowDownToLine,
  Check,
  EllipsisVertical,
  EyeIcon,
  Printer,
  RotateCcw,
  X,
  XCircle,
  CheckCircle,
} from "lucide-react";
import React from "react";
import ReactDOM from "react-dom/client";
import {
  DialogActions,
  Dialog as MuiDialog,
  DialogContent as MuiDialogContent,
  DialogTitle as MuiDialogTitle,
  Button as MuiButton,
  CircularProgress,
} from "@mui/material";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

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

  const { t: tCommon } = useTranslation("common");

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
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            newWindow.location.href = blobUrl;
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

  // ── Retour groupé (ancien comportement) ────────────────────────────────────
  const [openPopup, setOpenPopup] = React.useState(false);
  const [product_bill_ids, setProduct_bill_ids] = React.useState<number[]>([]);

  const handleClosePopup = () => setOpenPopup(false);

  const handleBulkReturn = async () => {
    onSetLoading(true);
    try {
      const response = await instance.post(
        `/bills/${bill.id}/packaging_return/`,
        { product_bill_ids },
        { withCredentials: true }
      );
      if (response.status === 200) {
        onGetData();
        setOpenPopup(false);
        return toast({
          title: tCommon("success"),
          description: response.data.success ?? tCommon("packaging_return.success"),
          icon: <CheckCircle className="size-4" />,
          variant: "success",
        });
      }
    } catch (error) {
      return toast({
        title: tCommon("error"),
        description: error.response?.data?.error ?? tCommon("errors.check_connection"),
        icon: <XCircle className="size-4" />,
        variant: "destructive",
      });
    } finally {
      onSetLoading(false);
    }
  };

  // ── Retour individuel (par emballage précis) ───────────────────────────────
  const [openSinglePopup, setOpenSinglePopup] = React.useState(false);
  const [selectedPpbId, setSelectedPpbId] = React.useState<number | null>(null);
  const [singleLoading, setSingleLoading] = React.useState(false);

  // Tous les PackageProductBill encore retournables (record > 0)
  const returnablePackages = bill.product_bills.flatMap((pb) => {
    if (pb.package_product_bill && pb.package_product_bill.record > 0) {
      return [
        {
          ppb_id: pb.package_product_bill.id,
          label: `${pb.product_details.name} → ${pb.package_product_bill.packaging_details?.name ?? pb.package_product_bill.name} (${pb.package_product_bill.record})`,
          record: pb.package_product_bill.record,
        },
      ];
    }
    return [];
  });

  const handleSingleReturn = async () => {
    if (!selectedPpbId) return;
    setSingleLoading(true);
    try {
      const response = await instance.post(
        `/bills/${bill.id}/packaging_return/${selectedPpbId}/`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        onGetData();
        setOpenSinglePopup(false);
        setSelectedPpbId(null);
        return toast({
          title: tCommon("success"),
          description: response.data.success ?? tCommon("packaging_return.success"),
          icon: <CheckCircle className="size-4" />,
          variant: "success",
        });
      }
    } catch (error) {
      return toast({
        title: tCommon("error"),
        description: error.response?.data?.error ?? tCommon("errors.check_connection"),
        icon: <XCircle className="size-4" />,
        variant: "destructive",
      });
    } finally {
      setSingleLoading(false);
    }
  };

  const hasPendingReturns =
    bill.product_bills.some((pb) => pb.record_package > 0) &&
    bill.state !== "created";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{tCommon("open_menu")}</span>
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleNavigate}>
            <EyeIcon size={14} className="mr-3" />
            {tCommon("actions.view_details")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenPDF("large")}>
            <Printer className="mr-3" size={14} />
            {tCommon("actions.print_invoice")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenPDF("small")}>
            <Printer className="mr-3" size={14} />
            {tCommon("actions.print_small")}
          </DropdownMenuItem>

          {hasPendingReturns && (
            <>
              <DropdownMenuSeparator />
              {/* Retour groupé */}
              <DropdownMenuItem onClick={() => setOpenPopup(true)}>
                <ArrowDownToLine className="mr-3" size={14} />
                {tCommon("actions.packaging_return")}
              </DropdownMenuItem>
              {/* Retour individuel */}
              {returnablePackages.length > 0 && (
                <DropdownMenuItem onClick={() => setOpenSinglePopup(true)}>
                  <RotateCcw className="mr-3" size={14} />
                  {tCommon("actions.packaging_return_single")}
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Dialog : retour groupé ──────────────────────────────────────────── */}
      <MuiDialog open={openPopup} onClose={handleClosePopup}>
        <MuiDialogTitle>
          {tCommon("dialogs.packaging_return_invoice", { number: bill.bill_number })}
        </MuiDialogTitle>
        <MuiDialogContent>
          <div className="space-y-3">
            <p className="text-sm text-orange-500">
              {tCommon("packaging_return.cash_note")}
            </p>
            <p className="font-medium text-base">
              {tCommon("packaging_return.items_intro")}
            </p>
            <div className="space-y-2 pl-2">
              {bill.product_bills.map((pb) => (
                <div className="flex items-center space-x-2" key={pb.id}>
                  <Checkbox
                    checked={product_bill_ids.includes(pb.id)}
                    onCheckedChange={(checked) =>
                      checked
                        ? setProduct_bill_ids([...product_bill_ids, pb.id])
                        : setProduct_bill_ids((items) =>
                          items.filter((item) => item !== pb.id)
                        )
                    }
                    id={`product-${pb.id}`}
                  />
                  <label
                    htmlFor={`product-${pb.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {pb.product_details.name} {" => "} {pb.record_package}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </MuiDialogContent>
        <DialogActions>
          <MuiButton disabled={loading} onClick={handleClosePopup} color="error">
            {tCommon("cancel")}
          </MuiButton>
          <MuiButton
            disabled={loading || product_bill_ids.length < 1}
            onClick={handleBulkReturn}
            color="success"
          >
            {loading ? tCommon("please wait") : tCommon("supplier.actions.confirm")}
          </MuiButton>
        </DialogActions>
      </MuiDialog>

      {/* ── Dialog : retour individuel ─────────────────────────────────────── */}
      <MuiDialog
        open={openSinglePopup}
        onClose={() => { setOpenSinglePopup(false); setSelectedPpbId(null); }}
      >
        <MuiDialogTitle>
          {tCommon("dialogs.packaging_return_single", { number: bill.bill_number })}
        </MuiDialogTitle>
        <MuiDialogContent>
          <div className="space-y-3 pt-1">
            <p className="text-sm text-orange-500">
              {tCommon("packaging_return.cash_note")}
            </p>
            <p className="text-sm font-medium">
              {tCommon("packaging_return.select_single")}
            </p>
            <div className="space-y-2 pl-1">
              {returnablePackages.map((pkg) => (
                <div
                  key={pkg.ppb_id}
                  role="button"
                  onClick={() => setSelectedPpbId(pkg.ppb_id)}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-4 py-3 text-sm cursor-pointer transition-colors",
                    selectedPpbId === pkg.ppb_id
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-border hover:bg-muted"
                  )}
                >
                  <span>{pkg.label}</span>
                  {selectedPpbId === pkg.ppb_id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </MuiDialogContent>
        <DialogActions>
          <MuiButton
            disabled={singleLoading}
            onClick={() => { setOpenSinglePopup(false); setSelectedPpbId(null); }}
            color="error"
          >
            {tCommon("cancel")}
          </MuiButton>
          <MuiButton
            disabled={singleLoading || !selectedPpbId}
            onClick={handleSingleReturn}
            color="success"
          >
            {singleLoading ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              tCommon("supplier.actions.confirm")
            )}
          </MuiButton>
        </DialogActions>
      </MuiDialog>
    </>
  );
};