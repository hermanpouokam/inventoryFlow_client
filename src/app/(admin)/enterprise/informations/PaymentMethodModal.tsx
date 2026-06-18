"use client";

import { useState } from "react";
import { CreditCard, Smartphone, Check, Lock } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DialogFooter } from "@/components/ui/dialog";
import {
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useStripe,
    useElements,
    Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useThemeMode } from "@/utils/theme-provider";
import { Button } from "@/components/ui/button";
import { instance } from "@/components/fetch";
import { getStripeErrorMessage } from "@/utils/stripeErrors";
import {
    validateOperatorPrefix,
    MTN_COUNTRY_CODES,
    ORANGE_COUNTRY_CODES,
} from "@/utils/mobileMoneyValidation";
import Spinner from "@/components/Spinner";
import { useTranslation } from "react-i18next";
import { PhoneInput, PhoneValue } from "@/components/phoneInput";

// ─── Types ────────────────────────────────────────────────────────────────────
type Method = "card" | "mtn" | "orange";

interface FieldState {
    complete: boolean;
    error: string | null;
}

interface Props {
    onClose: () => void;
    onConfirm?: (data: { method: Method; country?: string; phone?: string }) => void;
}

// ─── Stripe ───────────────────────────────────────────────────────────────────
const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);

// ─── MethodOption ─────────────────────────────────────────────────────────────
function MethodOption({
    active,
    onClick,
    icon,
    title,
    subtitle,
    accent,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    accent: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                active
                    ? "border-primary bg-primary/5 shadow-[var(--shadow-card)]"
                    : "border-border bg-card hover:bg-muted/40"
            }`}
        >
            <div
                className="w-10 h-10 rounded-md flex items-center justify-center text-white font-semibold shrink-0"
                style={{ background: accent }}
            >
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            </div>
            <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    active ? "border-primary bg-primary" : "border-border"
                }`}
            >
                {active && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
        </button>
    );
}

// ─── CardForm ─────────────────────────────────────────────────────────────────
function CardForm({
    cardOptions,
    cardName,
    onCardNameChange,
    onSubmit,
    onError,
    loading,
    error,
    onSetLoading,
}: {
    cardOptions: object;
    cardName: string;
    onCardNameChange: (v: string) => void;
    onSubmit: (setupIntentId: string) => void;
    onError: (msg: string) => void;
    loading: boolean;
    error: string | null;
    onSetLoading: (state: boolean) => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const { t } = useTranslation("common");

    const [fields, setFields] = useState<{
        number: FieldState;
        expiry: FieldState;
        cvc: FieldState;
    }>({
        number: { complete: false, error: null },
        expiry: { complete: false, error: null },
        cvc:    { complete: false, error: null },
    });

    const isCardReady =
        fields.number.complete &&
        fields.expiry.complete &&
        fields.cvc.complete &&
        cardName.trim().length > 1;

    const handleStripeSubmit = async () => {
        onSetLoading(true);
        if (!stripe || !elements || !isCardReady) {
            onSetLoading(false);
            return;
        }

        const cardElement = elements.getElement(CardNumberElement);
        if (!cardElement) {
            onSetLoading(false);
            return;
        }

        let clientSecret: string;
        try {
            const res = await fetch("/api/stripe/setup-intent/", { method: "POST" });
            const data = await res.json();
            if (!res.ok || !data.clientSecret) {
                onError(data.error ?? t("payment_method_modal.error_init"));
                onSetLoading(false);
                return;
            }
            clientSecret = data.clientSecret;
        } catch {
            onError(t("payment_method_modal.error_network"));
            onSetLoading(false);
            return;
        }

        const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(
            clientSecret,
            {
                payment_method: {
                    card: cardElement,
                    billing_details: { name: cardName },
                },
            }
        );

        if (stripeError || !setupIntent) {
            onError(getStripeErrorMessage(t, stripeError?.code));
            onSetLoading(false);
            return;
        }

        onSetLoading(false);
        onSubmit(setupIntent.id);
    };

    return (
        <div className="space-y-3 pt-2">
            <div>
                <label className="text-xs font-medium text-muted-foreground">
                    {t("payment_method_modal.card_number")}
                </label>
                <CardNumberElement
                    className="mt-1 w-full py-2.5 px-3 rounded-md border text-muted-foreground border-input bg-card text-sm outline-none focus:border-primary"
                    options={cardOptions}
                    onChange={(e) =>
                        setFields((s) => ({
                            ...s,
                            number: { complete: e.complete, error: e.error?.message ?? null },
                        }))
                    }
                />
                {fields.number.error && (
                    <p className="text-xs text-destructive mt-1">{fields.number.error}</p>
                )}
            </div>

            <div>
                <label className="text-xs font-medium text-muted-foreground">
                    {t("payment_method_modal.card_holder")}
                </label>
                <input
                    placeholder="AMINE MANSOURI"
                    value={cardName}
                    onChange={(e) => onCardNameChange(e.target.value.toUpperCase())}
                    maxLength={50}
                    className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-card text-sm outline-none focus:border-primary"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-medium text-muted-foreground">
                        {t("payment_method_modal.card_expiry")}
                    </label>
                    <CardExpiryElement
                        className="mt-1 w-full py-2.5 px-3 rounded-md border text-muted-foreground border-input bg-card text-sm outline-none focus:border-primary"
                        options={cardOptions}
                        onChange={(e) =>
                            setFields((s) => ({
                                ...s,
                                expiry: { complete: e.complete, error: e.error?.message ?? null },
                            }))
                        }
                    />
                    {fields.expiry.error && (
                        <p className="text-xs text-destructive mt-1">{fields.expiry.error}</p>
                    )}
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground">
                        {t("payment_method_modal.card_cvc")}
                    </label>
                    <CardCvcElement
                        className="mt-1 w-full py-2.5 px-3 rounded-md border text-muted-foreground border-input bg-card text-sm outline-none focus:border-primary"
                        options={cardOptions}
                        onChange={(e) =>
                            setFields((s) => ({
                                ...s,
                                cvc: { complete: e.complete, error: e.error?.message ?? null },
                            }))
                        }
                    />
                    {fields.cvc.error && (
                        <p className="text-xs text-destructive mt-1">{fields.cvc.error}</p>
                    )}
                </div>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <button
                type="button"
                id="card-submit-trigger"
                onClick={handleStripeSubmit}
                disabled={loading || !isCardReady}
                className="hidden"
                aria-hidden
            />
        </div>
    );
}

// ─── PaymentMethodModal ───────────────────────────────────────────────────────
export function PaymentMethodModal({ onConfirm, onClose }: Props) {
    const [method, setMethod] = useState<Method>("card");
    const [phoneValue, setPhoneValue] = useState<PhoneValue | null>(null);
    const [cardName, setCardName] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { userMode } = useThemeMode();
    const { t } = useTranslation("common");

    // Codes pays filtrés selon l'opérateur
    const allowedCountries = method === "mtn"
        ? [...MTN_COUNTRY_CODES]
        : [...ORANGE_COUNTRY_CODES];

    const CARD_OPTIONS = {
        style: {
            base: {
                color: userMode === "light" ? "#32325d" : "#fefefe",
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: "antialiased",
                fontSize: "16px",
                "::placeholder": { color: "#aab7c4" },
            },
            invalid: { color: "#fa755a", iconColor: "#fa755a" },
        },
    };

    // ── Carte Stripe ──────────────────────────────────────────────────────────
    const handleCardSubmit = async (setupIntentId: string) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/stripe/save-payment-method/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ setupIntentId }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? t("payment_method_modal.error_save_card"));
                return;
            }

            onConfirm?.({ method: "card" });
            onClose();
        } catch {
            setError(t("payment_method_modal.error_network"));
        } finally {
            setLoading(false);
        }
    };

    // ── MTN / Orange via NotchPay ─────────────────────────────────────────────
    const handleMobileConfirm = async () => {
        if (!phoneValue) {
            setError(t("payment_method_modal.error_phone_required"));
            return;
        }

        if (!phoneValue.isValid) {
            setError(t("payment_method_modal.error_phone_invalid"));
            return;
        }

        // Validation préfixe opérateur
        const prefixCheck = validateOperatorPrefix(
            method as "mtn" | "orange",
            phoneValue.country,
            phoneValue.nationalNumber,
            t
        );
        if (!prefixCheck.valid) {
            setError(prefixCheck.error!);
            return;
        }

        const fullPhone = phoneValue.internationalNumber.replace("+", "");

        // Vérification compte actif via NotchPay
        setVerifying(true);
        setError(null);

        try {
            const verifyRes = await fetch("/api/notchpay/verify-account/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: fullPhone, operator: method }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.verified && !verifyData.active) {
                setError(t("payment_method_modal.error_phone_inactive"));
                return;
            }
        } catch {
            // Fail open : si la vérification échoue réseau, on laisse passer
        } finally {
            setVerifying(false);
        }

        // Enregistrement du moyen de paiement (provider = mtn | orange)
        setLoading(true);

        try {
            await instance.post(
                `/payment-method/`,
                { provider: method, phone_number: fullPhone },
                { withCredentials: true }
            );

            onConfirm?.({
                method,
                country: phoneValue.country,
                phone: fullPhone,
            });
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.error ?? t("payment_method_modal.error_save"));
        } finally {
            setLoading(false);
        }
    };

    // ── Bouton principal ──────────────────────────────────────────────────────
    const handleConfirm = () => {
        if (method === "card") {
            document.getElementById("card-submit-trigger")?.click();
        } else {
            handleMobileConfirm();
        }
    };

    const isBusy = loading || verifying;

    return (
        <Card className="bg-background/80">
            <CardHeader className="pt-6 pb-4 border-b border-border">
                <CardTitle className="text-lg">
                    {t("payment_method_modal.title")}
                </CardTitle>
                <CardDescription>
                    {t("payment_method_modal.description")}
                </CardDescription>
            </CardHeader>

            <CardContent className="p-0 gap-0 overflow-hidden">
                <div className="px-6 py-5 space-y-4 max-h-[60vh] scrollbar overflow-y-auto">

                    {/* Sélection de la méthode */}
                    <div className="space-y-2">
                        <MethodOption
                            active={method === "card"}
                            onClick={() => { setMethod("card"); setError(null); setPhoneValue(null); }}
                            icon={<CreditCard className="w-5 h-5" />}
                            title={t("payment_method_modal.method_card_title")}
                            subtitle={t("payment_method_modal.method_card_subtitle")}
                            accent="linear-gradient(135deg, #1e3a8a, #4f46e5)"
                        />
                        <MethodOption
                            active={method === "mtn"}
                            onClick={() => { setMethod("mtn"); setError(null); setPhoneValue(null); }}
                            icon={<span className="text-[10px] font-bold">MTN</span>}
                            title={t("payment_method_modal.method_mtn_title")}
                            subtitle={t("payment_method_modal.method_mtn_subtitle")}
                            accent="linear-gradient(135deg, #facc15, #f59e0b)"
                        />
                        <MethodOption
                            active={method === "orange"}
                            onClick={() => { setMethod("orange"); setError(null); setPhoneValue(null); }}
                            icon={<Smartphone className="w-5 h-5" />}
                            title={t("payment_method_modal.method_orange_title")}
                            subtitle={t("payment_method_modal.method_orange_subtitle")}
                            accent="linear-gradient(135deg, #f97316, #ea580c)"
                        />
                    </div>

                    {/* Formulaire dynamique */}
                    {method === "card" ? (
                        <Elements stripe={stripePromise}>
                            <CardForm
                                cardOptions={CARD_OPTIONS}
                                cardName={cardName}
                                onCardNameChange={setCardName}
                                onSubmit={handleCardSubmit}
                                onError={setError}
                                loading={loading}
                                error={error}
                                onSetLoading={setLoading}
                            />
                        </Elements>
                    ) : (
                        <div className="space-y-3 pt-2">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                    {t("payment_method_modal.mobile_number")}
                                </label>
                                <PhoneInput
                                    key={method}
                                    defaultCountry="CM"
                                    choosedCountry={allowedCountries}
                                    onChange={(val) => {
                                        setPhoneValue(val);
                                        setError(null);
                                    }}
                                />
                            </div>

                            {error && (
                                <p className="text-sm font-medium text-destructive">{error}</p>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t border-border bg-muted/50 flex-row sm:justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isBusy}
                        className="h-10 px-4 rounded-md border border-border bg-card text-sm hover:bg-muted disabled:opacity-50"
                    >
                        {t("payment_method_modal.btn_cancel")}
                    </button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isBusy}
                        className="h-10 px-5 rounded-md text-sm font-medium text-primary-foreground shadow-[var(--shadow-elegant)]"
                        style={{ background: "var(--gradient-primary)" }}
                    >
                        {verifying ? (
                            <span className="flex items-center gap-2">
                                <Spinner />
                                {t("payment_method_modal.btn_verifying")}
                            </span>
                        ) : loading ? (
                            <span className="flex items-center gap-2">
                                <Spinner />
                                {t("payment_method_modal.btn_saving")}
                            </span>
                        ) : (
                            t("payment_method_modal.btn_save")
                        )}
                    </Button>
                </DialogFooter>
            </CardContent>
        </Card>
    );
}
