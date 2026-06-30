"use client";

import React from 'react'
import { useTranslation } from "react-i18next";

export default function page() {
    const { t } = useTranslation("common");

    return (
        <div>{t("pages.unauthorized.title")}</div>
    )
}
