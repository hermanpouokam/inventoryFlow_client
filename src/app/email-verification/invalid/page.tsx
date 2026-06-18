"use client";
import { useTranslation } from "react-i18next";
export default function EmailVerificationInvalid() {
    const { t } = useTranslation("common");
    return (
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-orange-600">{t("email_verification.invalid_title")} ⚠️</h1>
            <p className="mt-4">{t("email_verification.invalid_message")}</p>
        </div>
    )
}