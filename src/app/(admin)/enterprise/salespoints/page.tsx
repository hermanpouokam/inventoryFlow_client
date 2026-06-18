import { Suspense } from "react";
import i18n from "i18next";
import SalesPoint from "./SalesPoint";

export default function Page() {
  return (
    <Suspense fallback={<div>{i18n.t("loading")}</div>}>
      <SalesPoint />
    </Suspense>
  );
}
