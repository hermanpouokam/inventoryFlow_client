"use client";

import React, { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { MenuIcon, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export const links = [
  {
    titleKey: "landing.nav.services",
    link: "#services",
  },
  {
    titleKey: "landing.nav.testimonials",
    link: "#testimony",
  },
  {
    titleKey: "landing.nav.pricing",
    link: "#pricing",
  },
  {
    titleKey: "landing.nav.about",
    link: "#about-us",
  },
  {
    titleKey: "landing.nav.contact",
    link: "#contact",
  },
];

export default function PhoneVersion() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation("common");
  return (
    <div>
      <div className="flex lg:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
        >
          <span className="sr-only">{t("navigation.open_main_menu")}</span>
          <MenuIcon aria-hidden="true" className="size-6" />
        </button>
      </div>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">InventoryFlow</span>
              <img
                alt=""
                src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto"
              />
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">{t("navigation.close_menu")}</span>
              <X aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {links.map((item) => (
                  <a
                    key={item.titleKey}
                    href={item.link}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    {t(item.titleKey)}
                  </a>
                ))}
              </div>
              <div className="py-6">
                <a
                  href="/signup"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                >
                  {t("auth.signup")}
                </a>
                <a
                  href="/signin"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                >
                  {t("auth.signin")}
                </a>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
