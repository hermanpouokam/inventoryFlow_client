'use client'
import useTimer from "@/utils/useTimer";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function EmailVerificationSuccess() {
  const { t } = useTranslation("common");

  const initialTime = 5;
  const onTimerEnd = () => {
    window.location.assign("/settings");
  };
  const { timeLeft } = useTimer({
    initialTime,
    onTimerEnd
  })

  return (
    <div style={{ textAlign: 'center', padding: '40px', }} className="flex justify-center items-center min-h-screen">
      <div className="space-y-5">
        <h1 className="flex items-center justify-center text-lg font-bold text-green-500">{t("email_verification.success_title")} <CheckCircle2 className="h-5 w-5 ml-2" /></h1>
        <p className="font-medium text-muted-foreground">{t("email_verification.success_message", { time: timeLeft })}</p>
      </div>
    </div>
  );
}
