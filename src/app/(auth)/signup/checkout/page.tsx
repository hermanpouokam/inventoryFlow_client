import { Suspense } from "react";
import Checkout from "./Checkout";
import { initI18nServer } from "@/i18n/i18n.server";

export default async function Page() {

  const i18n = await initI18nServer("fr","common")
  
  return (
    <Suspense fallback={<div>{`${i18n.t("please wait")}...`}</div>}>
      <Checkout />
    </Suspense>
  );
}
