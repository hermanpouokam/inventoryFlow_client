"use client";
import { useTranslation } from "react-i18next";
export default function EmailVerificationError() {
  const { t } = useTranslation("common");
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h1>{t("email_verification.error_title")}</h1>
      <p>{t("email_verification.error_message")}</p>
    </div>
  );
}
