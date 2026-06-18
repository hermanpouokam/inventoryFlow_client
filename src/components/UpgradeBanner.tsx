"use client";

// components/UpgradeBanner.tsx
// Bandeau affiché à la place d'une feature bloquée par le plan.

import { ArrowLeft, Lock, TrendingUp, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Card } from "./ui/card";

interface UpgradeBannerProps {
  message?: string;
  /** Plan minimum requis à afficher dans le CTA */
  requiredPlan?: "pro" | "enterprise";
  /** Taille : compact (inline dans un formulaire) ou full (pleine zone) */
  size?: "compact" | "full";
}

export function UpgradeBanner({
  message,
  requiredPlan = "pro",
  size = "full",
}: UpgradeBannerProps) {
  const router = useRouter();
  const { t } = useTranslation("common");

  const planLabel = requiredPlan === "enterprise" ? "Enterprise" : "Pro";

  if (size === "compact") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-800/40 dark:bg-amber-950/20">
        <Lock className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
        {/* <span className="text-amber-800 dark:text-amber-300 line-clamp-1 ">
          {message ?? t("upgrade_banner.compact_default", { plan: planLabel })}
        </span> */}
        <button
          onClick={() => router.push("/enterprise/informations")}
          type="button"
          className="ml-auto shrink-0 rounded bg-amber-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-amber-700 transition-colors line-clamp-1"
        >
          {t("upgrade_banner.cta_short")}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* <div className="bg-black/60 blur-lg h-full w-full fixed top-0 left-0" /> */}
      <Card className="flex flex-col items-center justify-center gap-4 rounded-xl  px-8 py-12 text-center bg-background/80">
        {/* Icône */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-6 w-6 text-primary" />
        </div>

        {/* Texte */}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {message ?? t("upgrade_banner.title", { plan: planLabel })}
          </p>
          <p className="text-xs text-center text-muted-foreground">
            {t("upgrade_banner.subtitle", { plan: planLabel })}
          </p>
        </div>

        {/* CTA */}
        <div className="flex justify-center items-center gap-5">
          <button
            onClick={() => router.push("/enterprise/informations")}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            {t("upgrade_banner.cta", { plan: planLabel })}
          </button>
        </div>
      </Card>
    </div>
  );
}
