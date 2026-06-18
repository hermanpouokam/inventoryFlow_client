"use client";

// components/PlanGate.tsx
// Bloque l'affichage d'un enfant si le plan / feature / limite ne correspond pas.
//
// Exemples :
//   <PlanGate minPlan="pro">          → bloque si plan < pro
//   <PlanGate feature="custom_roles"> → bloque si feature booléenne = false
//   <PlanGate resource="products">    → bloque si limite de produits atteinte
//   <PlanGate ... fallback="null">    → retourne null au lieu du banner

import { ReactNode, useEffect } from "react";
import {
  useSubscription,
  PlanName,
  PlanLimits,
  PlanFeatures,
} from "../hooks/useSubscription";
import { UpgradeBanner } from "./UpgradeBanner";
import { AnimatePresence, motion } from "framer-motion";

interface PlanGateProps {
  feature?: keyof PlanFeatures;
  resource?: keyof PlanLimits;
  minPlan?: PlanName;
  children: ReactNode;
  fallback?: "banner" | "null";
  /** Taille du banner si fallback="banner" */
  bannerSize?: "compact" | "full";
}

export function PlanGate({
  feature,
  resource,
  minPlan,
  children,
  fallback = "banner",
  bannerSize = "full",
}: PlanGateProps) {
  const { hasFeature, canCreate, hasPlan, subscription, loading } =
    useSubscription();

  if (loading || !subscription) return null;

  let allowed = true;
  let reason = "";
  let requiredPlan: "pro" | "enterprise" = "pro";

  if (feature && !hasFeature(feature)) {
    allowed = false;
    reason = `Cette fonctionnalité n'est pas incluse dans votre plan ${subscription.plan}.`;
    // Les features "enterprise only" sont api_access, custom_roles, dedicated_support
    if (["api_access", "custom_roles", "dedicated_support"].includes(feature)) {
      requiredPlan = "enterprise";
    }
  }

  if (resource && !canCreate(resource)) {
    const limit = subscription.limits[resource];
    const used = subscription.usage[resource as keyof typeof subscription.usage];
    reason = `Limite atteinte : ${used}/${limit}. Passez au plan supérieur pour continuer.`;
    allowed = false;
  }

  if (minPlan && !hasPlan(minPlan)) {
    allowed = false;
    requiredPlan = minPlan === "enterprise" ? "enterprise" : "pro";
    reason = `Cette fonctionnalité requiert le plan ${minPlan} ou supérieur.`;
  }

  // if (!allowed && bannerSize === 'full') {
  //   document.body.style.overflow = 'hidden'
  // }

  if (!allowed && bannerSize === 'compact') {
    if (fallback === "null") return null;
    return (
      <UpgradeBanner
        message={reason}
        requiredPlan={requiredPlan}
        size={bannerSize}
      />
    );
  }

  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {(!allowed && bannerSize === 'full') &&
          <motion.div
            className="absolute top-0 left-0 w-full h-full z-30 overflow-hidden flex items-center justify-center backdrop-blur-lg bg-black/50 rounded-lg"
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
              <UpgradeBanner
                message={reason}
                requiredPlan={requiredPlan}
                size={bannerSize}
              />
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </div>
  );
}
