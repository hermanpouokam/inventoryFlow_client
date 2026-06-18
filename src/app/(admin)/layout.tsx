"use client";
import * as React from "react";
import moment from "moment";
import { Provider } from "react-redux";
import store from "@/redux/store";
import Navbar from "@/components/Navbar";
import { getToken, getUserData, storeUserData } from "@/components/auth";
import { instance } from "@/components/fetch";
import usePageTracking from "@/utils/usePageTracking";
import useInteractionTracking from "@/utils/useInteractionTracking";
import { useTranslation } from "react-i18next";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = React.useState(null)
  const { t } = useTranslation("common");
  React.useEffect(() => {
    const asyncFunc = async () => {
      const res = await instance.get("current-user");
      setUser(res.data)
      await storeUserData(res.data);
    };
    asyncFunc();
  }, []);
  usePageTracking();
  useInteractionTracking();
  return (
    <Provider store={store}>
      <Navbar />
      <main className="px-4 py-6 sm:px-6 min-h-full lg:px-8 body justify-center">
        <div className="max-w-[1600px] pt-[60px] m-auto sm:pt-12 overflow-hidden">
          {children}
        </div>
      </main>
      <footer className="py-2">
        <p className="text-center font-medium sm:text-[10px] text-[10px] text-muted-foreground bg-background">
          &copy; {moment().format("YYYY")} InventoryFlow {t("footer.by")} <a href="http://interact-inc.com" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold text-xs">Interact inc.</a> | {t("landing.footer.rights")}
        </p>
      </footer>
    </Provider>
  );
}
