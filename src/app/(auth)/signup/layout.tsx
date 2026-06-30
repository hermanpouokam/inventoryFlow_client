import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import { fallbackLng } from "@/i18n/config";
import { initI18nServer } from "@/i18n/i18n.server";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lng = cookieStore.get("i18next")?.value || fallbackLng;
  const i18n = await initI18nServer(lng, "common");

  return {
    title: i18n.t("common:metadata.auth.signup_title"),
    description: i18n.t("common:metadata.auth.description"),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className={inter.className}>{children}</main>
  );
}
