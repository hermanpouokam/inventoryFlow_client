"use client";
import { Inter } from "next/font/google";
import * as React from "react";
import moment from "moment";
import { Provider } from "react-redux";
import store from "@/redux/store";
import Navbar from "@/components/Navbar";
import { getToken, getUserData, storeUserData } from "@/components/auth";
import { instance } from "@/components/fetch";
import usePageTracking from "@/utils/usePageTracking";
import useInteractionTracking from "@/utils/useInteractionTracking";
import { AppProvider } from "@/context/GlobalContext";
import { PermissionProvider } from "@/context/PermissionContext";
import InitPermissions from "@/context/InitPermissions";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = React.useState(null)
  React.useEffect(() => {
    const asyncFunc = async () => {
      const res = await instance.get("current-user");
      setUser(res.data)
      await storeUserData(res.data);
      console.log(getToken());
    };
    asyncFunc();
  }, []);
  usePageTracking();
  useInteractionTracking();
  return (
    <Provider store={store}>
      <Navbar />
      <main className="bg-neutral-100 px-4 py-6 sm:px-6 min-h-screen lg:px-8 body justify-center">
        <div className="max-w-screen-[1600px] pt-[60px] m-auto sm:pt-12">
          {children}
        </div>
      </main>
      <footer className="py-3 bg-white shadow-inner">
        <p className="text-center font-medium text-sm text-muted-foreground">
          © {moment().format("YYYY")} InventoryFlow by Interact | Tous droits
          reservés.
        </p>
      </footer>
    </Provider>
  );
}
