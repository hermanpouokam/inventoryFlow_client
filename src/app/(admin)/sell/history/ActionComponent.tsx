import InvoicePDF from "@/app/pdf/invoiceA4Pdf";
import InvoiceSmallPDF from "@/app/pdf/invoiceSmallPDF";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { encryptParam } from "@/utils/encryptURL";
import { BlobProvider } from "@react-pdf/renderer";
import { EllipsisVertical, EyeIcon, Printer } from "lucide-react";
import React from "react";
import ReactDOM from "react-dom/client";

export const ActionComponent = ({ bill }: { bill: Bill }) => {
  const encryptedURl = encryptParam(`${bill.id}`);

  const handleNavigate = () => {
    return window.location.assign(`/sell/${encryptedURl}`);
  };

  const receiptData = {
    receipt_number: "R-00123",
    date: "2025-01-25",
    customer_name: "John Doe",
    items: [
      { name: "Item A", quantity: 2, price: 5.0 },
      { name: "Item B", quantity: 1, price: 15.0 },
      { name: "Item C", quantity: 3, price: 7.5 },
    ],
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
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
