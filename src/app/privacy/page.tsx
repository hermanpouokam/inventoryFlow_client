import { SiteHeader } from "@/components/legal/SiteHeader";
import { SiteFooter } from "@/components/legal/SiteFooter";
import { LegalPage } from "@/components/legal/LegalPage";

export default function Page() {
  return (
    <>
      <SiteHeader />
      <LegalPage />
      <SiteFooter />
    </>
  );
}
