
"use client";
export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { formatteCurrency } from "@/app/(admin)/stock/functions";
import { Checkbox, FormControlLabel } from "@mui/material";
import { cn } from "@/lib/utils";
import { getPlans, getUserData } from "@/components/auth";
import { loadStripe } from "@stripe/stripe-js";
import { CardNumberElement, Elements } from "@stripe/react-stripe-js";
import CustomCardForm from "@/components/creditCardForm";
import { generateRandomString, handlePaymentSuccess, updatePaimentMethod } from "../functions";
import { useSearchParams } from "next/navigation";
import { decryptParam } from "@/utils/encryptURL";
import useTimer from "@/utils/useTimer";
import CardBodyContent from "@/components/CardContent";
import { useTranslation } from "react-i18next";
import SecureLS from "secure-ls";
import { instance } from "@/components/fetch";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string);

export default function Checkout() {
  const { t } = useTranslation("common");

  // ── States généraux ────────────────────────────────────────────────────────
  const [checked, setChecked] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [planData, setPlanData] = useState<Plan | null>(null);
  const [currency] = useState("XAF");
  const [method, setMethod] = useState("card");
  const [error, setError] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [stripeData, setStripeData] = useState({ stripe: null, elements: null });

  // ── States Mobile Money (MTN / Orange via NotchPay) ────────────────────────
  const [mobilePhone, setMobilePhone] = useState("");
  const [notchPayReference, setNotchPayReference] = useState<string | null>(null);
  const [mobilePolling, setMobilePolling] = useState(false);

  // ── Timer de redirection après succès ─────────────────────────────────────
  const initialTime = 10;
  const { timeLeft, resetTimer, stopTimer } = useTimer({
    initialTime,
    onTimerEnd: () => window.location.assign("/dashboard"),
  });

  // ── Params URL ─────────────────────────────────────────────────────────────
  const urlParams = useSearchParams();
  const plan = urlParams.get("plan");
  const interval = urlParams.get("interval");
  const trxStatus = urlParams.get("status");
  const ref = urlParams.get("reference");
  const isAnnual = interval === "annual";

  // ── Prix affiché ───────────────────────────────────────────────────────────
  const baseMonthly = Number(planData?.price) ?? 0;
  const displayedPrice = isAnnual
    ? (Math.round(baseMonthly * 11 * 100) / 12 / 100) * 12
    : baseMonthly;

  // ── Fetch données ──────────────────────────────────────────────────────────
  const fetchPlan = async () => {
    const res = await getPlans(plan);
    setPlanData(res);
  };

  const getUser = async () => {
    const user = await getUserData();
    setUser(user);
  };

  useEffect(() => {
    getUser();
    fetchPlan();
    stopTimer();
  }, []);

  const handleStripeChange = useCallback((data: any) => {
    setStripeData(data);
  }, []);

  // ── Paiement Mobile Money via NotchPay (MTN ou Orange) ────────────────────
  const handleMobilePayment = async () => {
    if (!mobilePhone || mobilePhone.length < 9) {
      setError({ type: "error", msg: "Numéro de téléphone invalide (9 chiffres requis)." });
      return;
    }
    if (!checked) return;

    setLoading(true);
    setError(null);

    // Mapper la méthode vers le canal NotchPay
    const channelMap: Record<string, string> = {
      mtn: "cm.mtn",
      orange: "cm.orange",
    };
    const channel = channelMap[method];

    try {
      // 1. Initier le paiement via NotchPay
      const { data } = await instance.post("/notchpay/payment/", {
        phone: `237${mobilePhone}`,
        amount: displayedPrice,
        plan_id: planData?.id,
        interval,
        channel,
      });


      const { reference } = data;
      setNotchPayReference(reference);
      setMobilePolling(true);
      window.location.href = data.authorization_url
      // 2. Polling toutes les 3s — max 10 tentatives (30s)

    } catch (e: any) {
      console.log(e);
      const msg = e?.response?.data?.error ?? "Erreur réseau. Réessayez.";
      setError({ type: "error", msg });
      setLoading(false);
    }
  };

  const poll = async (reference: string) => {

    setMobilePolling(true)
    setLoading(true)

    try {
      const { data: statusData } = await instance.get(
        `/notchpay/payment/${reference}/`
      );

      if (statusData.is_paid) {
        setMobilePolling(false);
        setError({ type: "success", msg: t("checkout.payment_success") });
        resetTimer();
        setLoading(false);
        return;
      }

      if (
        statusData.notchpay_status === "failed" ||
        statusData.notchpay_status === "canceled"
      ) {
        setMobilePolling(false);
        setLoading(false);
        setError({
          type: "error",
          msg: `Paiement refusé. Vérifiez votre solde ${method === "mtn" ? "MTN" : "Orange"} Mobile Money.`,
        });
        return;
      }

    } catch (e) {
      console.log(e)
    }
  };

  // setTimeout(poll, 3000);

  useEffect(() => {
    if (trxStatus && ref) {
      poll(ref)
    }
  }, [ref, trxStatus]);

  // ── Paiement Stripe ────────────────────────────────────────────────────────
  const handleStripePayment = async () => {
    setLoading(true);

    const { stripe, elements } = stripeData;
    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    const cardElement = (elements as any).getElement(CardNumberElement);
    const { error, paymentMethod } = await (stripe as any).createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      setLoading(false);
      setError({ type: "error", msg: error.message });
      return;
    }

    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentMethodId: paymentMethod.id,
        email: user?.enterprise_details?.email ?? "",
        interval,
        amount: displayedPrice,
        currency,
        plan_id: planData?.id,
        enterprise_id: user?.enterprise_details?.id,
        access_token: localStorage.getItem("access_token"),
      }),
    });

    const result = await response.json();

    if (result.success) {
      setError({ type: "success", msg: t("checkout.payment_success") });
      resetTimer();
      setLoading(false);
    } else if (result.status === "requires_action") {
      const { error: confirmError } = await (stripe as any).confirmCardPayment(
        result.clientSecret
      );
      if (confirmError) {
        setError({ type: "error", msg: confirmError.message });
        setLoading(false);
      } else {
        setError({ type: "success", msg: t("checkout.payment_confirmed") });
        resetTimer();
      }
    } else {
      setError({ type: "error", msg: result.error || t("checkout.payment_failed") });
      setLoading(false);
    }
  };

  // ── Submit principal ───────────────────────────────────────────────────────
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (moment(user?.enterprise_details?.last_payment?.next_due_date).isAfter(moment()))
      return;
    if (!checked) return;

    if (method === "mtn" || method === "orange") {
      await handleMobilePayment();
      return;
    }

    if (method === "card") {
      await handleStripePayment();
      return;
    }
  };

  // ── Plan gratuit ───────────────────────────────────────────────────────────
  const handleContinue = async () => {
    try {
      setLoading(true);
      await instance.post(
        "/subscription/free-trial/",
        { plan_id: planData?.id },
        { withCredentials: true }
      );
      window.location.assign("/dashboard");
    } catch {
      setError({ type: "error", msg: t("errors.retry") });
    }
  };

  // ── Condition disabled du bouton ───────────────────────────────────────────
  const isButtonDisabled =
    loading ||
    (method === "card" && (!stripeData.elements || !stripeData.stripe)) ||
    ((method === "mtn" || method === "orange") && mobilePhone.length < 9) ||
    moment(user?.enterprise_details?.last_payment?.next_due_date).isAfter(moment());

  // ── Label du bouton ────────────────────────────────────────────────────────
  const providerLabel = method === "orange" ? "Orange Money" : "MTN Mobile Money";
  const buttonLabel = loading
    ? mobilePolling
      ? `Attente de confirmation ${providerLabel}...`
      : t("please wait")
    : `Payer ${formatteCurrency(displayedPrice, "XAF", "fr-FR")}`;

  // ── UI du formulaire Mobile Money ──────────────────────────────────────────
  const mobilePrefixStyle =
    method === "orange"
      ? "bg-orange-500 text-white"
      : "bg-yellow-400 text-red-600";

  return (
    <div className="relative overflow-hidden">
      {/* Décorations background */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="pointer-events-none absolute -left-20 top-1/3 h-60 w-60 rounded-full bg-primary/[0.04] blur-[80px]" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-60 w-60 rounded-full bg-primary/[0.04] blur-[80px]" />
      <div className="pointer-events-none absolute right-10 top-20 h-20 w-20 rotate-12 rounded-xl border border-primary/5 bg-primary/[0.02]" />
      <div className="pointer-events-none absolute left-16 bottom-32 h-16 w-16 -rotate-12 rounded-lg border border-primary/5 bg-primary/[0.02]" />

      <form onSubmit={handleSubmit}>
        <div className="p-1 sm:py-8 sm:px-6 flex">
          <div className="rounded shadow-sm py-16 px-3 sm:px-5 md:px-8 lg:px-10 space-y-5 col-span-4">

            {/* Messages erreur / succès */}
            {error?.type === "error" && (
              <h3 className="p-3 rounded bg-red-200 text-center text-red-500 border border-red-500">
                {error.msg}
              </h3>
            )}
            {error?.type === "success" && (
              <h3 className="p-3 rounded bg-green-200 text-center text-green-700 border border-green-500">
                {t("checkout.redirect_message", { message: error.msg, time: timeLeft })}
              </h3>
            )}

            {/* Header */}
            <div className="flex justify-between">
              <h3 className="text-2xl font-bold">{t("checkout.title")}</h3>
              <Button
                type="button"
                onClick={handleContinue}
                variant="link"
                className="text-purple-800 dark:text-purple-500 text-base"
              >
                {t("checkout.continue_without_payment")}
                <ChevronRight className="ml-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-col-2 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Colonne gauche */}
              <div className="col-span-3">

                {/* Infos utilisateur */}
                <CardBodyContent className="space-y-2 border rounded p-3 mt-2">
                  <span className="text-sm font-bold">{t("checkout.user_information")}</span>
                  <hr className="h-1" />
                  <div className="flex justify-between flex-wrap items-center gap-2 mt-2">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">{t("name")}:</p>
                      <p className="text-xs font-semibold">{user?.name} {user?.surname}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">email:</p>
                      <span className="text-xs font-semibold truncate w-full">{user?.email}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">{t("address")}:</p>
                      <span className="text-xs font-semibold">{user?.enterprise_details?.address ?? "N/A"}</span>
                    </div>
                  </div>
                </CardBodyContent>

                {/* Choix méthode de paiement */}
                <CardBodyContent className="space-y-2 border rounded p-3 mt-2">
                  <span className="text-sm font-bold">{t("checkout.payment_method")}</span>
                  <p className="text-xs text-muted-foreground -mt-2">{t("checkout.payment_method_description")}</p>
                  <hr className="h-1" />
                  <div className="flex justify-start items-center mt-2 flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="default"
                      onClick={() => { setMethod("card"); setMobilePhone(""); setNotchPayReference(null); }}
                      className={cn("bg-blue-500 text-white hover:bg-blue-400", method === "card" && "ring-2 ring-black")}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 0 24 24" className="mr-2">
                        <path fill="currentColor" d="M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2M4 6h16v2H4zm0 12v-6h16.001l.001 6z" />
                        <path fill="#fff" d="M6 14h6v2H6z" />
                      </svg>
                      {t("checkout.credit_card")}
                    </Button>

                    <Button
                      type="button"
                      variant="default"
                      onClick={() => { setMethod("mtn"); setMobilePhone(""); setNotchPayReference(null); }}
                      className={cn("bg-yellow-400 text-semibold text-red-500 hover:bg-yellow-500", method === "mtn" && "ring-2 ring-black")}
                    >
                      <span className="bg-blue-600 text-white px-3 rounded-full mr-1 py-1">
                        M<span className="text-yellow-500">T</span>N
                      </span>
                      Mobile Money
                    </Button>

                    <Button
                      type="button"
                      variant="default"
                      onClick={() => { setMethod("orange"); setMobilePhone(""); setNotchPayReference(null); }}
                      className={cn("bg-orange-500 text-white hover:bg-orange-400", method === "orange" && "ring-2 ring-black")}
                    >
                      Orange Money
                    </Button>
                  </div>
                </CardBodyContent>

                {/* Zone de saisie paiement */}
                <CardBodyContent className="space-y-2 border h-[290px] rounded p-3 mt-2">
                  <span className="text-sm font-bold">{t("checkout.payment_information")}</span>
                  <hr className="h-1" />

                  {method === "card" ? (
                    <Elements stripe={stripePromise}>
                      <CustomCardForm onChange={handleStripeChange} />
                    </Elements>

                  ) : method === "mtn" || method === "orange" ? (
                    <div className="space-y-3 pt-2">
                      <p className="text-xs text-muted-foreground">
                        Entrez votre numéro {method === "orange" ? "Orange Money" : "MTN Mobile Money"} pour recevoir une demande de paiement.
                      </p>

                      {/* Champ numéro */}
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <span className={cn("font-bold px-3 py-2 text-sm shrink-0", mobilePrefixStyle)}>
                          +237
                        </span>
                        <input
                          type="tel"
                          placeholder="6XX XXX XXX"
                          value={mobilePhone}
                          onChange={(e) => setMobilePhone(e.target.value.replace(/\D/g, ""))}
                          className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
                          maxLength={9}
                        />
                      </div>

                      {/* Indicateur polling */}
                      {mobilePolling && (
                        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                          <div className="w-3 h-3 rounded-full border-2 border-amber-600 border-t-transparent animate-spin shrink-0" />
                          <span>
                            Vérification en cours... Veuillez valider le paiement sur votre téléphone.
                          </span>
                        </div>
                      )}

                      {/* Confirmation référence envoyée */}
                      {notchPayReference && !mobilePolling && !error && (
                        <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded p-2">
                          ✓ Demande envoyée — réf : {notchPayReference.slice(0, 8)}...
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground pt-1">
                        Mode sandbox actif — utilise tes numéros de test NotchPay.
                      </p>
                    </div>

                  ) : (
                    <p className="text-sm text-muted-foreground">{t("checkout.select_payment_method")}</p>
                  )}
                </CardBodyContent>
              </div>

              {/* Colonne droite — résumé commande */}
              <div className="w-full mt-2 col-span-2">
                <CardBodyContent className="space-y-5 border rounded p-3">
                  <span className="text-sm font-bold">{t("checkout.purchase_details")}</span>
                  <hr className="h-1" />
                  <div className="text-xs font-semibold space-y-3">
                    <p>
                      <span className="text-muted-foreground">{t("checkout.designation")}</span>
                      : {planData?.name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">{t("checkout.due_date")}</span>
                      : {moment().format("L")}
                    </p>
                    <p>
                      <span className="text-muted-foreground">{t("checkout.duration")}</span>
                      : {planData?.duration * (isAnnual ? 12 : 1)} {t("checkout.months")}
                    </p>
                    <p>
                      <span className="text-muted-foreground">{t("checkout.expiration_date")}</span>
                      : {isAnnual ? moment().add(12, "months").format("L") : moment().add(30, "days").format("L")}
                    </p>
                  </div>
                  <hr className="h-1 mx-1" />
                  <span className="text-sm font-bold">{t("checkout.offer_details")}</span>
                  <div className="text-xs font-semibold space-y-3">
                    <p>
                      <span className="text-muted-foreground">{t("amount")}</span>
                      : {formatteCurrency(displayedPrice ?? 0, "XAF", "fr-FR")}
                    </p>
                    <p>
                      <span className="text-muted-foreground">{t("bills.columns.taxes")}</span>
                      : {formatteCurrency(0, "XAF", "fr-FR")}
                    </p>
                    <p>
                      <span className="text-muted-foreground">{t("checkout.duration")}</span>
                      : {isAnnual ? "12" : "1"} {t("checkout.months")}
                    </p>
                  </div>
                  <hr className="h-1 mx-1" />
                  <span className="text-sm font-bold">
                    {t("total")}: {formatteCurrency(displayedPrice ?? 0, "XAF", "fr-FR")}
                  </span>
                </CardBodyContent>

                {/* Checkbox + bouton payer */}
                <CardBodyContent className="space-y-5 border rounded p-3 mt-3">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={() => setChecked(!checked)}
                        required
                      />
                    }
                    htmlFor="terms"
                    label={t("checkout.terms_acceptance")}
                  />

                  <Button
                    type="submit"
                    className="w-full mt-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition disabled:bg-gray-400"
                    disabled={isButtonDisabled}
                  >
                    {buttonLabel}
                  </Button>

                  {moment(user?.enterprise_details?.last_payment?.next_due_date).isAfter(moment()) && (
                    <div className="flex items-center">
                      <span className="text-xs font-medium my-1 text-red-500">
                        {t("checkout.plan_already_active")}
                      </span>
                    </div>
                  )}
                </CardBodyContent>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}