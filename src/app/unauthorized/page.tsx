"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function Unauthorized() {
  const { t } = useTranslation("common");

  return (
    <div className="w-full place-items-center px-2 sm:px-0">
      <div className="flex-col justify-center items-center min-h-screen max-w-lg">
        <Image alt={t("pages.unauthorized.image_alt")} src="/401.svg" width={450} height={550} />
        <h2 className="text-center text-xl sm:text-3xl uppercase font-bold">
          {t("pages.unauthorized.title")}
        </h2>
        <h5 className="text-muted-foreground text-center text-md font-normal">
          {t("pages.unauthorized.description")}
        </h5>
        <div className="flex items-center justify-evenly gap-2 mt-10">
          <a
            href="/dashboard"
            className="font-normal text-md w-1/2 py-1 text-center rounded bg-violet-600 text-white"
          >
            {t("pages.actions.back")}
          </a>
          <a
            href="/dashboard"
            className="font-normal text-md w-1/2 py-1 text-center rounded border border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white transition"
          >
            {t("pages.actions.home")}
          </a>
        </div>
      </div>
    </div>
  );
}
