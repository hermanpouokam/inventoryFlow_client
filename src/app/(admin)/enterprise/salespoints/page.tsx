import { Suspense } from "react";
import SalesPoint from "./SalesPoint";

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <SalesPoint />
    </Suspense>
  );
}
