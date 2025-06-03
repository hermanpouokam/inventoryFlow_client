'use client'
import useTimer from "@/utils/useTimer";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

export default function EmailVerificationSuccess() {

  const initialTime = 5;
  const onTimerEnd = () => {
    window.location.assign("/dashboard");
  };
  const { timeLeft, isActive, resetTimer, stopTimer } = useTimer({
    initialTime,
    onTimerEnd
  })

  useEffect(() => {
    stopTimer();
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '40px', }} className="flex justify-center items-center min-h-screen">
      <div className="space-y-5">
        <h1 className="flex items-center justify-center text-lg font-bold text-green-500">Email vérifié <CheckCircle2 className="h-5 w-5 ml-2" /></h1>
        <p className="font-medium text-muted-foreground">Votre adresse email a été confirmée avec succès. Vous serez redirigé dans {timeLeft}</p>
      </div>
    </div>
  );
}
