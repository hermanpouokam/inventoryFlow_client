"use client";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { formatteCurrency } from "@/app/(admin)/stock/functions";
import { Checkbox, FormControlLabel } from "@mui/material";
import { cn } from "@/lib/utils";
import { getPlans, getUserData } from "@/components/auth";
import { loadStripe } from "@stripe/stripe-js";
import { CardNumberElement, Elements } from "@stripe/react-stripe-js";
import CustomCardForm from "@/components/creditCardForm";
import { handlePaymentSuccess } from "../functions";
import { useParams, useSearchParams } from "next/navigation";
import { decryptParam } from "@/utils/encryptURL";
import useTimer from "@/utils/useTimer";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Page() {
  const [checked, setChecked] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [planData, setPlanData] = useState<Plan | null>(null);
  const [stripeData, setStripeData] = useState({
    stripe: null,
    elements: null,
  });
  const initialTime = 5; // Different initial time
  const onTimerEnd = () => {
    window.location.assign("/dashboard");
  };

  const { timeLeft, isActive, resetTimer, stopTimer } = useTimer({
    initialTime,
    onTimerEnd,
  });

  const urlParams = useSearchParams();
  const encryptedSp = urlParams.get("plan");
  const plan = decryptParam(encryptedSp);

  const fetchPlan = async () => {
    const res = await getPlans(plan);
    setPlanData(res);
  };

  const [error, setError] = useState<{
    type: "error" | "success";
    msg: string;
  } | null>(null);
  const [method, setMethod] = useState("card");

  const getUser = async () => {
    const user = await getUserData();
    setUser(user);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { stripe, elements } = stripeData;

    if (!stripe || !elements) return setLoading(false);

    const cardElement = elements.getElement(CardNumberElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      setLoading(false);
      setError({
        type: "error",
        msg: error.message,
      });
    } else {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          amount: Number(planData?.price),
          currency: "XAF",
        }),
      });

      const result = await response.json();

      if (result.success) {
        await handlePaymentSuccess(result.paymentIntentId, planData?.price, 2);
        setError({
          type: "success",
          msg: result.message,
        });
        resetTimer();
        setLoading(false);
      } else if (result.status === "requires_action") {
        const { error: confirmError } = await stripe.confirmCardPayment(
          result.clientSecret
        );

        if (confirmError) {
          setError({
            type: "error",
            msg: confirmError.message,
          });
          setLoading(false);
        } else {
          await handlePaymentSuccess(
            result.paymentIntentId,
            planData?.price,
            2
          ); // Use the ID here
          setError({
            type: "success",
            msg: result.message,
          });
          setLoading(false);
          resetTimer();
        }
      } else {
        setLoading(false);
        setError({
          type: "error",
          msg: result.error,
        });
      }
    }
  };

  useEffect(() => {
    getUser();
    fetchPlan();
    stopTimer();
  }, []);

  const handleStripeChange = useCallback((data) => {
    setStripeData(data);
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-1 sm:py-14 sm:px-10  bg-neutral-200 flex w-screen body">
        <div className="bg-neutral-100 border rounded  max-w-[1600px] shadow-sm py-16 px-10 space-y-5 col-span-4">
          {error && error.type == "error" && (
            <h3 className="p-3 rounded bg-red-200 text-red-500 border border-red-500">
              {error.msg}
            </h3>
          )}
          {error && error.type == "success" && (
            <h3 className="p-3 rounded bg-green-200 text-green-700 border border-green-500">
              {error.msg} vous serez redirigé vers votre tableau de bord dans{" "}
              {timeLeft} sec
            </h3>
          )}

          <h3 className="text-2xl font-bold">Checkout</h3>
          <div className="grid grid-cols-2 sm:grid-col-2 md:grid-cols-2 lg:grid-cols-3 space-x-3 ">
            <div className="col-span-2">
              <div className="border-orange-500 rounded bg-orange-300 py-2 px-3 flex justify-start items-center gap-2 mt-3">
                <AlertCircle className="h-5 w-5" />
                <div className="">
                  <p className="text-sm font-semibold">Valider la commande</p>
                  <span className="text-sm leading-3">
                    Vous etes sur le point de valider votre commande.
                    selectionnez votre methode de paiement et validez votre
                    achat.
                  </span>
                </div>
              </div>
              <div className="bg-white space-y-2 border rounded border-slate-300 p-3 mt-2">
                <span className="text-sm font-bold">
                  Informations d'utilisateur
                </span>
                <hr className="h-1" />
                <div className="flex justify-between flex-wrap items-center gap-2 mt-2">
                  <div className="">
                    <p className="text-xs font-semibold text-muted-foreground">
                      name:
                    </p>
                    <span className="text-xs font-semibold">
                      {user?.name} {user?.surname}
                    </span>
                  </div>
                  <div className="">
                    <p className="text-xs font-semibold text-muted-foreground">
                      email:
                    </p>
                    <span className="text-xs font-semibold truncate w-full">
                      {user?.email}
                    </span>
                  </div>

                  <div className="">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Adresse:
                    </p>
                    <span className="text-xs font-semibold">
                      {user?.enterprise_details?.address}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white space-y-2 border rounded border-slate-300 p-3 mt-2">
                <span className="text-sm font-bold">Methode de paiement</span>
                <p className="text-xs text-muted-foreground -mt-2">
                  Sélectionnez votre methode de paiement et continuer
                </p>
                <hr className="h-1" />
                <div className="flex justify-start items-center  mt-2 flex-wrap gap-2">
                  <Button
                    variant={"default"}
                    onClick={() => setMethod("card")}
                    className={cn(
                      "bg-blue-500 text-white hover:bg-blue-400",
                      method == "card" && "ring-2 ring-black"
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="29"
                      height="29"
                      viewBox="0 0 24 24"
                      className="mr-2"
                    >
                      <path
                        fill="currentColor"
                        d="M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2M4 6h16v2H4zm0 12v-6h16.001l.001 6z"
                      />
                      <path fill="#fff" d="M6 14h6v2H6z" />
                    </svg>{" "}
                    Carte de credit
                  </Button>
                  <Button
                    variant={"default"}
                    onClick={() => setMethod("mtn")}
                    className={cn(
                      "bg-yellow-400 text-semibold text-red-500 hover:bg-yellow-500",
                      method == "mtn" && "ring-2 ring-black"
                    )}
                  >
                    <span className="bg-blue-600 text-white px-3 rounded-full mr-1 py-1">
                      M<span className="text-yellow-500">T</span>N
                    </span>{" "}
                    Mobile Money
                  </Button>
                  <Button
                    variant={"default"}
                    onClick={() => setMethod("orange")}
                    className={cn(
                      "bg-orange-500 text-white hover:bg-orange-400",
                      method == "orange" && "ring-2 ring-black"
                    )}
                  >
                    Orange Money
                  </Button>
                </div>
              </div>
              <div className="bg-white space-y-2 border h-[290px] rounded border-slate-300 p-3 mt-2">
                <span className="text-sm font-bold">
                  Informations de paiement
                </span>
                <hr className="h-1" />
                {method == "card" ? (
                  <Elements stripe={stripePromise}>
                    <CustomCardForm onChange={handleStripeChange} />
                    {/* <button
                      type="submit"
                      className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Payer
                    </button> */}
                  </Elements>
                ) : method == "mtn" ? (
                  // <TextField fullWidth size="small" label="entrez votre numero" />
                  <p>Indisponible pour le moment</p>
                ) : method == "orange" ? (
                  // <OrangeMoneyValidator onChange={setOrangeData} />
                  <p>Indisponible pour le moment</p>
                ) : (
                  <p>selctionnez une methode de paiement</p>
                )}
              </div>
              {/* <div className="bg-white space-y-5 border flex items-baseline gap-3 justify-start rounded border-slate-300 p-3 mt-3">
                <div className="p-2 bg-orange-200 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-foreground">
                    Politique d'annulation
                  </h3>
                  <p className="text-xs">
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                    Eius quidem recusandae maxime provident consequuntur ea
                    ullam ab nam. Id amet sunt nisi laborum? Iure quisquam,
                    exercitationem necessitatibus sunt praesentium nihil.
                    Aliquam, possimus quia! necessitatibus sunt praesentium
                    nihil. Aliquam, possimus quia! necessitatibus sunt
                    praesentium nihil. Aliquam, possimus quia!
                  </p>
                  <a href="" className="text-blue-500 text-sm">
                    Lire plus
                  </a>
                </div>
              </div> */}
            </div>
            <div className="col-span-1 mt-2">
              <div className="bg-white space-y-5 border rounded border-slate-300 p-3">
                <span className="text-sm font-bold">Détails de l'achat</span>
                <hr className="h-1" />
                <div className="text-xs font-semibold space-y-3">
                  <p className="">
                    <span className="text-muted-foreground">Désignation</span>:
                    {planData?.name}
                  </p>
                  <p className="">
                    <span className="text-muted-foreground">
                      Date d'échéance
                    </span>
                    : {moment().format("L")}
                  </p>
                  <p className="">
                    <span className="text-muted-foreground">Durée</span>:{" "}
                    {planData?.duration}
                  </p>
                  <p className="">
                    <span className="text-muted-foreground">
                      Date d'expiration
                    </span>
                    : {moment().add(30, "days").format("L")}
                  </p>
                </div>
                <hr className="h-1 mx-1" />
                <span className="text-sm font-bold">Détails d'offre</span>
                <div className="text-xs font-semibold space-y-3">
                  <p className="">
                    <span className="text-muted-foreground">Montant</span>:{" "}
                    {formatteCurrency(planData?.price ?? 0, "XAF", "fr-FR")}
                  </p>
                  <p className="">
                    <span className="text-muted-foreground">Taxes</span>:{" "}
                    {formatteCurrency(0, "XAF", "fr-FR")}
                  </p>
                  <p className="">
                    <span className="text-muted-foreground">Durée</span>: 30
                    jours
                  </p>
                </div>
                <hr className="h-1 mx-1" />
                <span className="text-sm font-bold">
                  Total:{" "}
                  {formatteCurrency(planData?.price ?? 0, "XAF", "fr-FR")}
                </span>
              </div>
              <div className="bg-white space-y-5 border rounded border-slate-300 p-3 mt-3">
                <div className="flex items-center  space-x-2">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={() => setChecked(!checked)}
                        required
                      />
                    }
                    htmlFor="terms"
                    label={
                      "En validant ce paiement vous acceptez nos termes & conditions et politique de confidentialité "
                    }
                  />
                </div>
                <Button
                  // onClick={handlePayment}
                  type="submit"
                  className="w-full mt-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition disabled:bg-gray-400"
                  disabled={
                    loading || !stripeData.elements || !stripeData.stripe
                  }
                >
                  {loading
                    ? "Veuillez patienter..."
                    : `Payer ${formatteCurrency(
                        planData?.price ?? 0,
                        "XAF",
                        "fr-FR"
                      )}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
