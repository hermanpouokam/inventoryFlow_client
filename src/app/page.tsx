import type { Metadata } from "next";
import { cookies } from "next/headers";

import { InventoryFlowLanding } from "@/components/InventoryFlowLanding";
import { fallbackLng } from "@/i18n/config";
import { initI18nServer } from "@/i18n/i18n.server";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lng = cookieStore.get("i18next")?.value || fallbackLng;
  const i18n = await initI18nServer(lng, "common");

  return {
    title: i18n.t("common:metadata.landing.title"),
    description: i18n.t("common:metadata.landing.description"),
  };
}

export default function Page() {
  return <InventoryFlowLanding />;
}
