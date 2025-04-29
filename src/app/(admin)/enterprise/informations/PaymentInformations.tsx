"use client";
import { instance } from "@/components/fetch";
import { Button } from "@/components/ui/button";
import { mois } from "@/utils/constants";
import { CircularProgress } from "@mui/material";
import { ArrowDown, CheckCircle, CircleAlert, Pencil } from "lucide-react";
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

const PaymentInformations = React.memo(() => {
  const [payments, setPayments] = useState<PaymentInfo[] | null>(null);
  const [paiementMethod, setPaymentMethod] = useState<paymentMethod | null>(
    null
  );

  useEffect(() => {
    // Charger les données de l'entreprise actuelle depuis l'API
    instance
      .get("/payments/history/")
      .then((response) => {
        setPayments(response.data);
      })
      .catch((error) => {
        console.error("Error loading enterprise data", error);
      });
    instance
      .get("/payment-method/")
      .then((response) => {
        setPaymentMethod(response.data);
      })
      .catch((error) => {
        console.error("Error loading payment method", error);
      });
  }, []);

  const handlePrintInvoice = (invoice_id: number) => {
    const response = instance.get(
      `http://127.0.0.1:8000/api/payments/invoice/${invoice_id}`
    );
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
        <div className="border-2 bg-slate-100 rounded px-3 py-5 space-y-2">
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
              {mois[moment(payments[0].next_due_date).month()]}
            </span>
          </p>
        </div>
        <div className="border-2 bg-slate-100 rounded px-3 py-5 space-y-2">
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
        </div>
        <div className="border-2 bg-slate-100 rounded px-3 py-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-medium text-muted-foreground">
              Méthode de paiement
            </p>
            <Button variant={"outline"}>Editer</Button>
          </div>
          {paiementMethod ? (
            paiementMethod.type === "card" ? (
              <>
                {/* <p className="font-medium">Herman pouokam</p> */}
                <p className="font-medium first-letter:capitalize">
                  {paiementMethod.brand} terminant par {paiementMethod.last4}
                </p>
                <p className="font-medium">
                  Expire le: {paiementMethod.exp_month}/
                  {String(paiementMethod.exp_year).slice(2, 4)}
                </p>
              </>
            ) : (
              <p></p>
            )
          ) : null}
        </div>
      </div>
      <hr />
      <h3 className="text-lg text-foreground font-semibold mb-2">
        Historique de factures
      </h3>
      <Table className="border rounded">
        <TableCaption>Liste de vos précedentes factures.</TableCaption>
        <TableHeader className="bg-slate-100">
          <TableRow>
            <TableHead className="">#</TableHead>
            <TableHead className="">Numero de facture</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right"></TableHead>
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
                <TableCell>
                  <Button
                    onClick={() => handlePrintInvoice(payment.id)}
                    variant={"ghost"}
                  >
                    Télécharger <ArrowDown className="ml-1 h-4 w-4" />
                  </Button>
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
        <TableHeader className="bg-slate-100">
          <TableRow>
            <TableHead className="">#</TableHead>
            <TableHead className="">Id de transaction</TableHead>
            <TableHead className="">Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
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
            <TableCell colSpan={6}>Total</TableCell>
            <TableCell className="text-right">$2,500.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
});

export default PaymentInformations;
