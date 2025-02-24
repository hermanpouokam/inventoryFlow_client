"use client";
import { AppDispatch, RootState } from "@/redux/store";
import { decryptParam } from "@/utils/encryptURL";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import * as React from "react";
import { fetchBill } from "@/redux/billDetailsSlicer";
import { formatteCurrency } from "../../stock/functions";
import { Box, Divider, Fab } from "@mui/material";
import { PrintTwoTone } from "@mui/icons-material";
import { Button } from "@/components/ui/button";
import { PrinterIcon } from "lucide-react";
import { BlobProvider } from "@react-pdf/renderer";
import InvoicePDF from "@/app/pdf/invoiceA4Pdf";
import ReactDOM from "react-dom/client";

export default function Page({ params }: { params: { id: string } }) {
  const decryptedParams = decryptParam(decodeURIComponent(params.id));
  const { bill, error, status } = useSelector((state: RootState) => state.bill);

  const dispatch: AppDispatch = useDispatch();

  React.useEffect(() => {
    if (status == "idle") {
      dispatch(fetchBill({ billId: decryptedParams }));
    }
  }, [decryptedParams, dispatch, status]);

  const handleOpenPDF = () => {
    const newWindow = window.open("", "_blank");
    if (!newWindow) {
      alert("Failed to open a new tab. Please allow popups for this site.");
      return;
    }
    newWindow.document.write("<p>Loading PDF...</p>");
    const pdfBlobProvider = (
      <BlobProvider document={<InvoicePDF bill={bill} />}>
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
    <main className="space-y-5">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="border border-slate-400 p-3 mb-4 space-y-2">
          <h2 className="text-3xl font-semibold text-center uppercase mb-2">
            {bill?.sales_point_details.name}
          </h2>
          <div className="flex justify-around items-center gap-5">
            <p className="font-semibold uppercase">
              N<sup>o</sup> CONT: {"N/A"}
            </p>
            <p className="font-semibold uppercase">
              ADRESSE: {bill?.sales_point_details.address}
            </p>
          </div>
          <div className="flex justify-around items-center gap-5">
            <p className="font-semibold uppercase">
              E-MAIL: {bill?.sales_point_details?.email ?? "N/A"}
            </p>
            <p className="font-semibold uppercase">
              NUMERO: {bill?.sales_point_details.number ?? "N/A"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6 mt-6 place-content-between">
          <div className="font-medium space-y-1">
            <p>
              Facture N<sup>o</sup>: {bill?.bill_number}
            </p>
            <p>Client: {bill?.customer_name}</p>
            <p>Code client: {bill?.customer_details.code}</p>
          </div>
          <div className="font-medium space-y-1 justify-end items-end">
            <p>
              Operateur: {bill?.operator_details?.name.toUpperCase()}{" "}
              {bill?.operator_details?.surname}
            </p>
            {/* @ts-ignore */}
            <p>Créer le: {new Date(bill?.created_at).toLocaleString()} </p>
            <p>Imprimer le: {new Date().toLocaleString()}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Produits</h3>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2">Code</th>
                <th className="py-2">Produits</th>
                <th className="py-2 text-right">Quantité</th>
                <th className="py-2 text-right">Prix</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {bill?.product_bills.map((product: ProductBill, index) => (
                <tr key={index} className="border-t">
                  <td className="py-2 text-center">
                    {product.product_details.product_code}
                  </td>
                  <td className="py-2 text-center">
                    {product.product_details.name}
                  </td>
                  <td className="py-2 text-right">{product.quantity}</td>
                  <td className="py-2 text-right">{product.price}</td>
                  <td className="py-2 text-right">
                    {formatteCurrency(product.total_amount, "XAF", "fr-FR")}
                  </td>
                </tr>
              ))}
              <tr className="border-t">
                <th className="text-right py-2 font-semibold" colSpan={2}>
                  Total
                </th>
                <td className="text-right py-2 font-semibold" colSpan={1}>
                  {bill?.product_bills.reduce(
                    (acc, curr) => (acc += curr.quantity),
                    0
                  )}
                </td>
                <th className="text-right py-2 font-semibold" colSpan={1}>
                  {"-"}
                </th>
                <td className="text-right py-2 font-semibold">
                  {" "}
                  {formatteCurrency(bill?.total ?? 0, "XAF", "fr-FR")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {bill?.product_bills.some(
          (productBill) => productBill.package_product_bill !== null
        ) && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Emballages</h3>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2">Produits</th>
                  <th className="py-2">Emballages</th>
                  <th className="py-2 text-right">Consigné</th>
                  <th className="py-2 text-right">Prix</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {bill?.product_bills.map((product: ProductBill, index) => {
                  const packageProduct = product?.package_product_bill;
                  if (packageProduct) {
                    return (
                      <tr key={index} className="border-t">
                        <td className="py-2 text-center">
                          {product.product_details.product_code}
                        </td>
                        <td className="py-2 text-right">
                          {packageProduct.packaging_details.name}
                        </td>
                        <td className="py-2 text-right">
                          {packageProduct.record}
                        </td>
                        <td className="py-2 text-right">
                          {Number(packageProduct.packaging_details.price)}
                        </td>
                        <td className="py-2 text-right">
                          {packageProduct.total_amount}
                        </td>
                      </tr>
                    );
                  }
                })}
                <tr className="border-t">
                  <th className="text-right py-2 font-semibold" colSpan={2}>
                    Total
                  </th>
                  <td className="text-right py-2 font-semibold" colSpan={1}>
                    {bill?.product_bills.reduce(
                      (acc, curr) =>
                        (acc += curr.package_product_bill?.record ?? 0),
                      0
                    )}
                  </td>
                  <th className="text-right py-2 font-semibold" colSpan={1}>
                    {"-"}
                  </th>
                  <td className="text-right py-2">
                    {" "}
                    {formatteCurrency(
                      bill?.product_bills.reduce(
                        (acc, curr) =>
                          (acc += curr.package_product_bill?.total_amount ?? 0),
                        0
                      ),
                      "XAF",
                      "fr-FR"
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <div className="mb-3">
          {bill?.taxes.map((tax) => (
            <div className="grid grid-cols-2 items-center">
              <div className="">
                <h2 className="text-base text-right font-semibold">
                  {tax.tax_name}
                </h2>
              </div>
              <h2 className="text-base text-right font-semibold">
                {formatteCurrency(tax.value, "XAF", "fr-FR")}
              </h2>
            </div>
          ))}
        </div>
        <Divider />
        <p className="mt-2 mb-6 text-lg text-right font-semibold">
          Net à payer:{" "}
          {formatteCurrency(
            bill
              ? bill?.total_bill_amount +
                  bill?.taxes.reduce((val, el) => {
                    return (val += el.value);
                  }, 0)
              : 0,
            "XAF",
            "fr-Fr"
          )}
        </p>
        <div className="grid grid-cols-2 gap-4 my-[4rem] mb-40 place-items-center">
          <div>
            <h3 className="font-semibold">Signature du vendeur</h3>
          </div>
          <div>
            <h3 className="font-semibold">Signature du client</h3>
          </div>
        </div>
        <p
          className="text-center 
        text-[10px] mt-20"
        >
          Made by <a className="font-bold">inventoryFlow</a>
        </p>
      </div>
      <div className="shadow-lg shadow-slate-500 rounded-xl drop-shadow fixed bottom-6 right-6">
        <Button
          onClick={handleOpenPDF}
          variant={"default"}
          className="rounded-xl py-2"
        >
          <PrinterIcon className="mr-2" />
          Imprimer
        </Button>
      </div>
    </main>
  );
}
