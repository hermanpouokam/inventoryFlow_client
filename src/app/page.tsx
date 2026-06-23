import type { Metadata } from "next";

import { InventoryFlowLanding } from "@/components/InventoryFlowLanding";

export const metadata: Metadata = {
  title: "InventoryFlow - Pilotez votre activité en temps réel",
  description:
    "Ventes, inventaire, finances et équipes réunis dans une seule plateforme opérationnelle pour les entreprises africaines.",
};

export default function Page() {
  return <InventoryFlowLanding />;
}
