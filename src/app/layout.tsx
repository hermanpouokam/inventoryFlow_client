import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Inter as FontSans } from "next/font/google";
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
import { CssBaseline } from '@mui/material';
import ThemeProviderClient from "@/utils/theme-provider";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";

export const viewport: Viewport = {
  themeColor: "#5b21b6",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lng = cookieStore.get('i18next')?.value || fallbackLng;
  const i18n = await initI18nServer(lng, 'common');

  return {
    title: "InventoryFlow",
    description: i18n.t("common:metadata.root.description"),
    applicationName: "InventoryFlow",
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "InventoryFlow",
    },
    icons: {
      icon: [
        { url: "/icons/favicon.ico", sizes: "any" },
        { url: "/icons/icon.svg", type: "image/svg+xml" },
        { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [
        { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        { rel: "mask-icon", url: "/icons/icon.svg", color: "#5b21b6" },
      ],
    },
    openGraph: {
      title: "InventoryFlow",
      description: i18n.t("common:metadata.root.description"),
      images: [{ url: "/icons/icon-512x512.png" }],
    },
  };
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookieStore = await cookies();
  const lng = cookieStore.get('i18next')?.value || fallbackLng;

  await initI18nServer(lng);
  const user = await getUserWithPermissions();
  const permissions = sanitizePermissions(user?.action_permissions || []);
  const pagePermissions = sanitizePagePermissions(user?.permissions || []);
  const theme = cookieStore.get('theme')?.value || 'system';

  return (
    <html lang={lng} className={theme === 'dark' ? 'dark' : ''}>
      <Script
        dangerouslySetInnerHTML={{
          __html: `
                  (function() {
                    const userMode = '${theme}';
                    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    let resolved = userMode === 'system'
                      ? (systemDark ? 'dark' : 'light')
                      : userMode;

                    if (resolved === 'dark') {
                      document.documentElement.classList.add('dark');
                    }
                  })();
                  `,
        }}
      />
      <head>
        <link rel="apple-touch-startup-image" href="/icons/apple-touch-icon.png" />
        <meta name="msapplication-TileColor" content="#5b21b6" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
      </head>
      <body
        className={cn(
          "font-sans antialiased scrollbar scroll-smooth p-0",
          fontSans.variable
        )}
      >
        <AppProvider>
          <CssBaseline />

          <PermissionProvider initialPermissions={permissions} initialPagePermissions={pagePermissions} user={user}>
            <I18nProvider locale={lng}>
              <NuqsAdapter>
                <ThemeProviderClient initialMode={theme}>
                  {children}
                </ThemeProviderClient>
                <Toaster />
              </NuqsAdapter>
            </I18nProvider>
          </PermissionProvider>
        </AppProvider>
      </body>
    </html>
  );
}
