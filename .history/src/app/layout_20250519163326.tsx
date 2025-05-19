import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Inter as FontSans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import '../i18n/i18n.client';
import { cookies } from 'next/headers';
import { fallbackLng } from '@/i18n/config';
import { initI18nServer } from '@/i18n/i18n.server';
import I18nProvider from '@/i18n/I18nProvider';
import { AppProvider } from "@/context/GlobalContext";
import { PermissionProvider } from "@/context/PermissionContext";
import { getUserWithPermissions } from "@/lib/permissions";
import { sanitizePermissions } from "@/constants/permissions";
import { sanitizePagePermissions } from "@/constants/pagePermissions";
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export const metadata: Metadata = {
  title: "InventoryFlow",
  description: "Your inventory manager",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookieStore = cookies();
  const lng = cookieStore.get('i18next')?.value || fallbackLng;

  // Assure SSR pour html lang
  await initI18nServer(lng);
  const user = await getUserWithPermissions();
  const permissions = sanitizePermissions(user?.action_permissions || []);
  const pagePermissions = sanitizePagePermissions(user?.permissions || []);
  return (
    <html lang={lng}>
      <body
        className={cn(
          "bg-neutral-100 font-sans antialiased scrollbar scroll-smooth",
          fontSans.variable
        )}
      >
        <AppProvider>
          <PermissionProvider initialPermissions={permissions} initialPagePermissions={pagePermissions} user={user}>
            <I18nProvider locale={lng}>
              <NuqsAdapter>
                {children}
              </NuqsAdapter>
            </I18nProvider>
          </PermissionProvider>
        </AppProvider>
        <Toaster />
      </body>
    </html>
  );
}
