import { Suspense } from "react";
import CreateEnterprise from "./CreateEnterprise";

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <CreateEnterprise />
    </Suspense>
  );
}
