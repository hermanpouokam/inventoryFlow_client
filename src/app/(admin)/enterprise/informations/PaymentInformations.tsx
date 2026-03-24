"use client";
import { instance } from "@/components/fetch";
import { Button } from "@/components/ui/button";
import { mois } from "@/utils/constants";
import { CircularProgress } from "@mui/material";
import { ArrowDown, CheckCircle, CircleAlert, Ellipsis, Pencil, PencilIcon, Printer, ShareIcon, TrashIcon, Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatteCurrency } from "../../stock/functions";
import { cn } from "@/lib/utils";
import CardBodyContent from "@/components/CardContent";
import { BlobProvider } from "@react-pdf/renderer";
import PlanInvoice from "@/app/pdf/planInvoice";
import ReactDOM from "react-dom/client";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { stripe } from "@/lib/stripe";
import { Skeleton } from "@/components/ui/skeleton";


const cardStyles: Record<string, string> = {
  visa: "bg-blue-50 text-blue-700 border-blue-200",
  mastercard: "bg-red-50 text-red-600 border-red-200",
  amex: "bg-indigo-50 text-indigo-700 border-indigo-200",
  discover: "bg-orange-50 text-orange-600 border-orange-200",
  jcb: "bg-green-50 text-green-700 border-green-200",
  unionpay: "bg-red-50 text-red-700 border-red-200",
  default: "bg-gray-100 text-gray-500 border-gray-200"
};

const PaymentInformations = React.memo(() => {
  const [payments, setPayments] = useState<PaymentInfo[] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<paymentMethod | "not_configured" | null>(null);

  const { t } = useTranslation('common')

  async function getPaymentIntent(paymentIntentId: string) {
    const res = await fetch("/api/stripe/payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentIntentId }),
    });

    const data = await res.json();
    return data;
  }

  useEffect(() => {
    instance
      .get("/payments/history/")
      .then(async (response) => {
        const data = response.data;
        setPayments(response.data);
        if (response.data.length === 0) return
        if (data[0].payment_method == "card") {
          const paymentIntent = await getPaymentIntent(response.data[0].payment_intent);
          return setPaymentMethod(paymentIntent);
          console.log(paymentIntent)
        } else {
          return setPaymentMethod("not_configured")
        }
      })
      .catch((error) => {
        console.error("Error loading enterprise data", error);
      });

  }, []);

  const handleOpenPDF = (payment: PaymentInfo) => {
    if (payment.status === 'failed') return
    const newWindow = window.open("", "_blank");
    if (!newWindow) {
      alert("Failed to open a new tab. Please allow popups for this site.");
      return;
    }
    try {
      newWindow.document.write("<p>Loading PDF...</p>");
      const pdfBlobProvider = (
        <BlobProvider document={<PlanInvoice payment={payment} />}>
          {/* @ts-ignore */}
          {({ blob }) => {
            console.log("blob", blob);
            if (blob) {
              const blobUrl = URL.createObjectURL(blob);
              newWindow.location.href = blobUrl;
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
    } catch (error) {
      console.log(error)
    }
  };

  if (!payments) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }



  return (
    <div className="space-y-5">
      <h3 className="text-lg text-foreground font-semibold mb-2">
        Methode de paiement
      </h3>
      <hr />
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 xl:grid-cols-4">
        <CardBodyContent className=" bg-background rounded px-5 py-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-medium text-muted-foreground">
              Cycle de paiement
            </p>
            <CircleAlert className="h-6 w-6 cursor-pointer" />
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="font-medium">
              {payments[0].plan.name}:{" "}
              <span className="capitalize">
                {formatteCurrency(payments[0].plan.price)}
              </span>
            </p>
            <Pencil className="w-4 h-4 hover:text-green-500 cursor-pointer" />
          </div>
          <p className="font-medium">
            En cours:{" "}
            <span className="capitalize">
              {moment(payments[0].payment_date).format("DD")}{" "}
              {mois[moment(payments[0].payment_date).month()]} -{" "}
              {moment(payments[0].next_due_date).format("DD")}{" "}
              {mois[moment(payments[0].next_due_date).month()]}
            </span>
          </p>
          <p className="font-medium">
            Prochaine échéance:{" "}
            <span className="capitalize">
              {moment(payments[0].next_due_date).format("DD")}{" "}
              {mois[moment(payments[0].next_due_date).month()]}{" "}
              {moment(payments[0].next_due_date).format("YYYY")}
            </span>
          </p>
        </CardBodyContent>
        <CardBodyContent className="border-2 bg-background rounded px-3 py-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-medium text-muted-foreground">Solde de dette</p>
            <Button
              variant={"outline"}
              disabled={moment(payments[0].next_due_date).isAfter(moment())}
            >
              Payer
            </Button>
          </div>
          <p className="font-medium text-2xl flex items-center ">
            {moment(payments[0].next_due_date).isAfter(moment())
              ? formatteCurrency(0)
              : formatteCurrency(payments[0].amount)}{" "}
            <CheckCircle className="w-5 h-5 text-green-500 ml-3" />
          </p>
        </CardBodyContent>
        <CardBodyContent className="border-2 bg-background rounded px-3 py-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-medium text-muted-foreground">
              Méthode de paiement
            </p>
            <Button variant={"outline"}>Editer</Button>
          </div>
          {paymentMethod ? (
            payments[0].payment_method === "card" ? (
              <>
                {/* <p className="font-medium">Herman pouokam</p> */}
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-10 h-6 rounded flex items-center justify-center text-[11px] font-bold border ${cardStyles[paymentMethod.card.brand] || cardStyles.default}`}>
                    {paymentMethod.card.brand.toUpperCase()}
                  </div>

                  <span className="text-sm text-hero-muted">
                    •••• {paymentMethod.card.last4}
                  </span>
                </div>
                <p className="font-medium">
                  Expire le: {paymentMethod.card.exp_month}/
                  {String(paymentMethod.card.exp_year).slice(2, 4)}
                </p>
              </>
            ) : (
              <p></p>
            )
          ) :
            <>
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-4" />
            </>
          }
        </CardBodyContent>
      </div>
      <hr />
      <h3 className="text-lg text-foreground font-semibold mb-2">
        Historique de factures
      </h3>
      <Table className="border rounded">
        <TableCaption>Liste de vos précedentes factures.</TableCaption>
        <TableHeader className="bg-background">
          <TableRow>
            <TableHead className="">#</TableHead>
            <TableHead className="">Numero de facture</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...payments]
            .filter((el) => el.status === "completed")
            .map((el, i) => {
              const index = i + 1;
              return { ...el, index };
            })
            .map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.index}</TableCell>
                <TableCell className="font-medium">
                  {payment.invoice_number}
                </TableCell>
                <TableCell className="capitalize">
                  {moment(payment.payment_date).format("DD/MM/YYYY HH:mm")}
                </TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost"><Ellipsis /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => handleOpenPDF(payment)}>
                          <Printer />
                          {t('print')}
                        </DropdownMenuItem>
                        {
                          payment.status === 'pending' &&
                          <DropdownMenuItem>
                            <Wallet />
                            {t('pay')}
                          </DropdownMenuItem>
                        }
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <hr />
      <h3 className="text-lg text-foreground font-semibold mb-2">
        Historique de paiements
      </h3>
      <Table className="border rounded">
        <TableCaption>Liste de vos précedents paiements.</TableCaption>
        <TableHeader className="">
          <TableRow>
            <TableCell className="">#</TableCell>
            <TableCell className="">Id de transaction</TableCell>
            <TableCell className="">Plan</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Method</TableCell>
            <TableCell>Date</TableCell>
            <TableCell className="text-right">Amount</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...payments]
            .map((el, i) => {
              const index = i + 1;
              return { ...el, index };
            })
            .map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.index}</TableCell>
                <TableCell className="font-medium">
                  {payment.payment_id}
                </TableCell>
                <TableCell className="capitalize">
                  {payment.plan.name}
                </TableCell>
                <TableCell className="select-none">
                  <span
                    className={cn(
                      "font-semibold border rounded-full px-3 py-1",
                      payment.status == "failed"
                        ? "border-red-600 text-red-600"
                        : "",
                      payment.status == "completed"
                        ? "border-green-700 text-green-700"
                        : "",
                      payment.status == "pending"
                        ? "border-orange-500 text-orange-500"
                        : ""
                    )}
                  >
                    {payment.status}
                  </span>
                </TableCell>
                <TableCell className="capitalize">
                  {payment.payment_method}
                </TableCell>
                <TableCell>
                  {moment(payment.payment_date).format("DD/MM/YYYY HH:mm")}
                </TableCell>
                <TableCell className="text-right">
                  {formatteCurrency(payment.amount)}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6} className="text-right">Total</TableCell>
            <TableCell className="text-right">$2,500.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
});

export default PaymentInformations;
