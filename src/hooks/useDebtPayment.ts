// hooks/useDebtPayment.ts
// Gère le flow de paiement de dette — NotchPay Mobile Money (polling) ou Stripe (instantané)

import { useState } from "react";
import { instance } from "@/components/auth";

export type PaymentStep =
  | "idle"
  | "checking_method"
  | "sending"
  | "waiting_confirmation"  // NotchPay Mobile Money — attente validation téléphone
  | "processing"            // Stripe — traitement carte
  | "success"
  | "error";

export interface DebtPaymentState {
  step: PaymentStep;
  error: string | null;
  provider: string | null;
  maskedPhone: string | null;
  cardLast4: string | null;
}

export function useDebtPayment() {
  const [state, setState] = useState<DebtPaymentState>({
    step: "idle",
    error: null,
    provider: null,
    maskedPhone: null,
    cardLast4: null,
  });

  const reset = () =>
    setState({ step: "idle", error: null, provider: null, maskedPhone: null, cardLast4: null });

  // ── Vérifier si un moyen de paiement est enregistré ───────────────────────
  const checkPaymentMethod = async (): Promise<{
    hasMethod: boolean;
    method: any | null;
  }> => {
    setState((s) => ({ ...s, step: "checking_method" }));
    try {
      const { data } = await instance.get("/api/payment-method/");
      const active = data.active;
      if (!active) return { hasMethod: false, method: null };

      setState((s) => ({
        ...s,
        provider: active.provider,
        maskedPhone: active.phone_number ?? null,
        cardLast4: active.card_last4 ?? null,
      }));
      return { hasMethod: true, method: active };
    } catch {
      return { hasMethod: false, method: null };
    }
  };

  // ── Payer la dette ─────────────────────────────────────────────────────────
  const payDebt = async (
    debtAmount: number,
    planId: number,
    interval: string,
    method: any
  ): Promise<boolean> => {

    // MTN et Orange passent désormais tous les deux par NotchPay
    if (method.provider === "mtn" || method.provider === "orange" || method.provider === "notchpay") {
      return await _payWithNotchPay(debtAmount, planId, interval, method.phone_number, method.provider);
    }

    if (method.provider === "stripe") {
      return await _payWithStripe(debtAmount, planId, interval);
    }

    setState((s) => ({ ...s, step: "error", error: "Provider non supporté." }));
    return false;
  };

  // ── Paiement NotchPay Mobile Money (MTN / Orange) ─────────────────────────
  const _payWithNotchPay = async (
    amount: number,
    planId: number,
    interval: string,
    phone: string,
    provider: string
  ): Promise<boolean> => {
    setState((s) => ({ ...s, step: "sending" }));

    // Mapper le provider vers le canal NotchPay
    const channelMap: Record<string, string> = {
      mtn: "cm.mtn",
      orange: "cm.orange",
    };
    const channel = channelMap[provider] ?? undefined;

    try {
      const { data } = await instance.post("/api/notchpay/payment/", {
        phone,
        amount,
        plan_id: planId,
        interval,
        ...(channel ? { channel } : {}),
      });

      const { reference } = data;
      setState((s) => ({ ...s, step: "waiting_confirmation" }));

      // Polling toutes les 3s — max 10 tentatives (30s)
      return await _pollNotchPay(reference);

    } catch (e: any) {
      const msg = e?.response?.data?.error ?? "Erreur lors de l'initiation du paiement Mobile Money.";
      setState((s) => ({ ...s, step: "error", error: msg }));
      return false;
    }
  };

  const _pollNotchPay = (reference: string): Promise<boolean> => {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 10;

      const poll = async () => {
        if (attempts >= maxAttempts) {
          setState((s) => ({
            ...s,
            step: "error",
            error: "Délai dépassé. Vérifiez votre téléphone et réessayez.",
          }));
          resolve(false);
          return;
        }

        attempts++;

        try {
          const { data } = await instance.get(`/api/notchpay/payment/${reference}/`);

          if (data.is_paid) {
            setState((s) => ({ ...s, step: "success" }));
            resolve(true);
            return;
          }

          if (data.notchpay_status === "failed" || data.notchpay_status === "canceled") {
            setState((s) => ({
              ...s,
              step: "error",
              error: "Paiement refusé. Vérifiez votre solde et réessayez.",
            }));
            resolve(false);
            return;
          }

          // PENDING — continuer
          setTimeout(poll, 3000);
        } catch {
          setTimeout(poll, 3000);
        }
      };

      setTimeout(poll, 3000);
    });
  };

  // ── Paiement Stripe (off-session) ──────────────────────────────────────────
  const _payWithStripe = async (
    amount: number,
    planId: number,
    interval: string
  ): Promise<boolean> => {
    setState((s) => ({ ...s, step: "processing" }));

    try {
      const { data } = await instance.post("/api/subscription/pay-debt/", {
        amount,
        plan_id: planId,
        interval,
        payment_method: "stripe",
      });

      if (data.success) {
        setState((s) => ({ ...s, step: "success" }));
        return true;
      }

      setState((s) => ({ ...s, step: "error", error: data.error ?? "Erreur Stripe." }));
      return false;
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? "Erreur lors du paiement carte.";
      setState((s) => ({ ...s, step: "error", error: msg }));
      return false;
    }
  };

  return { state, checkPaymentMethod, payDebt, reset };
}
