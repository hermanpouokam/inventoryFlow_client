"use client";

import React from "react";
import { useTranslation } from "react-i18next";

export default function Page() {
  const { t } = useTranslation("common");

  return <div>{t("losses.title")}</div>;
}
