import { CheckCircle2 } from "lucide-react";

export default function EmailVerificationSuccess() {
  return (
    <div style={{ textAlign: 'center', padding: '40px', }} className="flex justify-center items-center min-h-screen">
      <div className="space-y-5">
        <h1 className="flex items-center justify-center text-lg font-bold ">Email vérifié <CheckCircle2 /></h1>
        <p>Votre adresse email a été confirmée avec succès.</p>
      </div>
    </div>
  );
}
