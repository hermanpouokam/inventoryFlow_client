// hooks/useSubscription.ts
// Récupère l'état d'abonnement depuis /api/subscription/status/
// et expose des helpers pour vérifier les plans, features et limites.

import { useEffect, useState, useCallback } from "react";
import { instance } from "@/components/fetch";

// ─── Types (miroir du backend) ─────────────────────────────────────────────────
export type PlanName = "basic" | "pro" | "enterprise";

export interface PlanFeatures {
  advanced_billing: boolean;
  api_access: boolean;
  custom_roles: boolean;
  priority_support: boolean;
  dedicated_support: boolean;
  custom_logic: boolean;
}

export interface PlanLimits {
  sales_points: number | null;
  products: number | null;
  users: number | null;
  suppliers: number | null;
  employees: number | null
}

export interface PlanUsage {
  sales_points: number;
  products: number;
  users: number;
  employees: number
}

export interface PlanUsagePct {
  sales_points: number | null;
  products: number | null;
  users: number | null;
  employees: number | null;
}

export interface SubscriptionState {
  plan: PlanName;
  plan_price: number;
  is_active: boolean;
  expires_at: string | null;
  limits: PlanLimits;
  features: PlanFeatures;
  usage: PlanUsage;
  usage_pct: PlanUsagePct;
  // état abonnement (engine)
  status: "active" | "expiring_soon" | "active_debt" | "stopped" | "no_plan";
  days_left: number | null;
  debt: {
    months_consumed: number;
    amount_due: number;
    started_at: string;
    status: string;
  } | null;
  can_access: boolean;
}

const PLAN_ORDER: PlanName[] = ["basic", "pro", "enterprise"];

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await instance.get("/subscription/status/", {
        withCredentials: true,
      });
      setSubscription(data as SubscriptionState);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Impossible de charger l'abonnement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** L'enterprise a-t-elle au moins le plan `min` ? */
  const hasPlan = useCallback(
    (min: PlanName): boolean => {
      if (!subscription) return false;
      return PLAN_ORDER.indexOf(subscription.plan) >= PLAN_ORDER.indexOf(min);
    },
    [subscription]
  );

  /** La feature booléenne est-elle incluse dans le plan actuel ? */
  const hasFeature = useCallback(
    (feature: keyof PlanFeatures): boolean => {
      if (!subscription) return false;
      return subscription.features[feature] === true;
    },
    [subscription]
  );

  /**
   * Peut-on encore créer une ressource du type donné ?
   * Retourne true si illimité (null) ou si usage < limite.
   */
  const canCreate = useCallback(
    (resource: keyof PlanLimits): boolean => {
      if (!subscription) return false;
      const limit = subscription.limits[resource];
      if (limit === null || limit === undefined) return true; // illimité
      const used = subscription.usage[resource as keyof PlanUsage] ?? 0;
      return used < limit;
    },
    [subscription]
  );

  /** Pourcentage d'utilisation d'une ressource (0–100). Null si illimité. */
  const usagePct = useCallback(
    (resource: keyof PlanLimits): number | null => {
      if (!subscription) return null;
      return subscription.usage_pct[resource as keyof PlanUsagePct] ?? null;
    },
    [subscription]
  );

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    hasPlan,
    hasFeature,
    canCreate,
    usagePct,
  };
}
