import React, { Suspense } from "react";
import i18n from "i18next";
import Finances from "./Finance";

export default function Page() {
  return (
    <Suspense fallback={<div>{i18n.t("loading")}</div>}>
      <Finances />
    </Suspense>
  );
}
