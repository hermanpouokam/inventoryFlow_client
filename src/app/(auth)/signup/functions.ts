import { instance } from "@/components/fetch";

const handlePaymentSuccess = async (paymentIntentId, amount, planId) => {
  try {
    const response = await instance.post("/payments/info/", {
      plan_id: planId,
      amount: amount,
      payment_method: "card",
      payment_intent: paymentIntentId,
    });
    console.log({
      plan_id: planId,
      amount: amount,
      payment_method: "card",
      payment_intent: paymentIntentId,
    });
    if (response.status === 201) {
      console.log("Paiement enregistré avec succès !");
    } else {
      console.error(
        "Erreur lors de l'enregistrement du paiement:",
        response.data
      );
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
  }
};

const clearStorageAndCookies = () => {
  // Clear local storage
  localStorage.clear();
  sessionStorage.clear();

  document.cookie =
    "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie =
    "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  window.location.reload();
};

export { handlePaymentSuccess, clearStorageAndCookies };
