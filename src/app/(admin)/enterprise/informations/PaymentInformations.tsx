"use client";
import { instance } from "@/components/fetch";
import { Button } from "@/components/ui/button";
import { mois } from "@/utils/constants";
import { CircularProgress } from "@mui/material";
import { CheckCircle, CircleAlert, Ellipsis, Pencil, Printer, Wallet } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
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
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentMethodModal } from "./PaymentMethodModal";
import { formatDate } from "@/utils/utils";


const cardStyles: Record<string, string> = {
  visa: "bg-blue-50 text-blue-700 border-blue-200",
  mastercard: "bg-red-50 text-red-600 border-red-200",
  amex: "bg-indigo-50 text-indigo-700 border-indigo-200",
  discover: "bg-orange-50 text-orange-600 border-orange-200",
  jcb: "bg-green-50 text-green-700 border-green-200",
  unionpay: "bg-red-50 text-red-700 border-red-200",
  default: "bg-gray-100 text-gray-500 border-gray-200",
};

const PaymentInformations = React.memo(() => {
  const [payments, setPayments] = useState<PaymentInfo[] | null>(null);
  const [debt, setDebt] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null | undefined>(undefined);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentInfo[] | null>(null);

  const { t } = useTranslation("common");

  const fetchPaymentMethod = useCallback(() => {
    instance
      .get("/payment-method/")
      .then((response) => setPaymentMethod(response.data.active))
      .catch((error) => console.error("Error loading payment method", error));
  }, []);

  useEffect(() => {
    fetchPaymentMethod();
    instance
      .get("/subscription/status/")
      .then((response) => setSubscription(response.data))
      .catch((error) => console.error("Error loading subscription", error));
    instance
      .get("/subscription/debt/")
      .then((response) => {
        if (response.data.message) { setDebt(null); return; }
        setDebt(response.data);
      })
      .catch((error) => console.error("Error loading debt", error));
    instance
      .get("/payments/history/")
      .then((response) => setPaymentHistory(response.data))
      .catch((error) => console.error("Error loading payment history", error));
  }, [fetchPaymentMethod]);

  const handlePaymentMethodSaved = useCallback(() => {
    setPaymentMethod(undefined);
    fetchPaymentMethod();
    setShowPaymentModal(false);
  }, [fetchPaymentMethod]);

  const handleOpenPDF = (payment: PaymentInfo) => {
    if (payment.status === "failed") return;
    const newWindow = window.open("", "_blank");
    if (!newWindow) {
      alert(t("enterprise_information.popup_blocked"));
      return;
    }
    try {
      newWindow.document.write(`<p>${t("enterprise_information.loading_pdf")}</p>`);
      const pdfBlobProvider = (
        <BlobProvider document={<PlanInvoice payment={payment} />}>
          {/* @ts-ignore */}
          {({ blob }) => {
            if (blob) {
              const blobUrl = URL.createObjectURL(blob);
              newWindow.location.href = blobUrl;
            } else {
              newWindow.document.write(`<p>${t("enterprise_information.pdf_load_failed")}</p>`);
            }
          }}
        </BlobProvider>
      );
      const container = document.createElement("div");
      document.body.appendChild(container);
      const root = ReactDOM.createRoot(container);
      root.render(pdfBlobProvider);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    document.body.style.overflow = showPaymentModal ? "hidden" : "auto";
  }, [showPaymentModal]);

  if (!subscription) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="space-y-5 overflow-x-hidden">
      <h3 className="text-lg text-foreground font-semibold mb-2">
        {t("enterprise_information.payment_method")}
      </h3>
      <hr />
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 xl:grid-cols-4">

        {/* Cycle de facturation */}
        <CardBodyContent className="bg-background px-5 py-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-medium text-muted-foreground">
              {t("enterprise_information.payment_cycle")}
            </p>
            <CircleAlert className="h-6 w-6 cursor-pointer" />
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="font-medium">
              {subscription.plan}:{" "}
              <span className="capitalize">
                {formatteCurrency(subscription.plan_price)}
              </span>
            </p>
            <Pencil className="w-4 h-4 hover:text-green-500 cursor-pointer" />
          </div>
          <p className="font-medium">
            {t("enterprise_information.next_due_date")}:{" "}
            <span className="capitalize">
              {moment(subscription.expires_at).format("DD")}{" "}
              {mois[moment(subscription.expires_at).month()]}{" "}
              {moment(subscription.expires_at).format("YYYY")}
            </span>
          </p>
        </CardBodyContent>

        {/* Solde dette */}
        <CardBodyContent className="border-2 bg-background px-3 py-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-medium text-muted-foreground">
              {t("enterprise_information.debt_balance")}
            </p>
            <Button variant="outline" disabled={!debt}>
              {t("pay")}
            </Button>
          </div>
          {debt ? (
            <p className="font-medium text-2xl flex items-center">
              {formatDate(debt.started_at).long()}
              <CheckCircle className="w-5 h-5 text-green-500 ml-3" />
            </p>
          ) : (
            <p>{t("enterprise_information.no_debt")}</p>
          )}
        </CardBodyContent>

        {/* Moyen de paiement */}
        <CardBodyContent className="border-2 bg-background px-3 py-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-medium text-muted-foreground">
              {t("enterprise_information.payment_method")}
            </p>
            <Button onClick={() => setShowPaymentModal(true)} variant="outline">
              {t("edit")}
            </Button>
          </div>

          {paymentMethod === undefined ? (
            <>
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-4" />
            </>
          ) : paymentMethod === null ? (
            <p className="text-sm text-muted-foreground">
              {t("enterprise_information.no_payment_method")}
            </p>
          ) : paymentMethod.provider === "stripe" ? (
            <>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-10 h-6 rounded flex items-center justify-center text-[11px] font-bold border ${cardStyles[paymentMethod.card_brand] || cardStyles.default}`}
                >
                  {paymentMethod.card_brand.toUpperCase()}
                </div>
                <span className="text-sm text-hero-muted">
                  •••• {paymentMethod.card_last4}
                </span>
              </div>
              <p className="font-medium">
                {t("enterprise_information.expires_on")}: {paymentMethod.card_exp}
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <div
                className={`w-10 h-6 rounded flex items-center justify-center text-[11px] font-bold border ${paymentMethod.provider === "mtn"
                  ? "bg-yellow-400/10 text-yellow-600 border-yellow-400"
                  : "bg-orange-400/10 text-orange-600 border-orange-400"
                  }`}
              >
                {paymentMethod.provider.toUpperCase()}
              </div>
              <span className="text-sm">{paymentMethod.phone_number}</span>
            </div>
          )}
        </CardBodyContent>
      </div>

      <hr />
      <h3 className="text-lg text-foreground font-semibold mb-2">
        {t("billing.invoice_history")}
      </h3>
      <Table className="border rounded">
        <TableCaption>{t("billing.payment_history_caption")}</TableCaption>
        <TableHeader className="bg-background">
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>{t("date")}</TableHead>
            <TableHead>{t("amount")}</TableHead>
            <TableHead>{t("billing.columns.method")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead className="text-center">{t("actions.title")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paymentHistory === null ? (
            [...Array(3)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(6)].map((_, j) => (
                  <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                ))}
              </TableRow>
            ))
          ) : paymentHistory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                {t("billing.no_payments")}
              </TableCell>
            </TableRow>
          ) : (
            paymentHistory.map((payment, i) => (
              <TableRow key={payment.id ?? i}>
                <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                <TableCell className="text-sm">
                  {moment(payment.paid_at ?? payment.created_at).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {formatteCurrency(payment.amount)}
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border",
                    payment.payment_method === "mtn"
                      ? "bg-yellow-400/10 text-yellow-700 border-yellow-300"
                      : payment.payment_method === "orange"
                        ? "bg-orange-400/10 text-orange-600 border-orange-300"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                  )}>
                    {(payment.payment_method ?? "stripe").toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    payment.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : payment.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-600"
                  )}>
                    {payment.status === "completed" && <CheckCircle className="w-3 h-3" />}
                    {t(`billing.status.${payment.status}`, { defaultValue: payment.status })}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {payment.status === "completed" && (
                    <button
                      onClick={() => handleOpenPDF(payment)}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Printer className="w-3 h-3" />
                      PDF
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <hr />
      <h3 className="text-lg text-foreground font-semibold mb-2">
        {t("billing.payment_history")}
      </h3>

      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            className="absolute -top-5 left-0 w-screen h-full z-50 overflow-hidden flex items-center justify-center bg-black/40 backdrop-blur-md"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.5 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <PaymentMethodModal
                onConfirm={handlePaymentMethodSaved}
                onClose={() => setShowPaymentModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default PaymentInformations;
