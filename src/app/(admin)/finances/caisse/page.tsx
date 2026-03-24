import React, { Suspense } from "react";
import Finances from "./Finance";

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <Finances />
    </Suspense>
  );
}
