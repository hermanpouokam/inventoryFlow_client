import { instance } from "@/components/fetch";

const handlePaymentSuccess = async (paymentIntentId: string, amount?: string, planId?: number, status?: string) => {
  try {
    const response = await instance.post("/payments/info/", {
      plan_id: planId,
      amount: amount,
      payment_method: "card",
      payment_intent: paymentIntentId,
      status
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
const updatePaimentMethod = async (paymentMethodId: string, customerId: string) => {
  try {
    const response = await instance.post(`/update-payment-method/`, {
      paymentMethodId,
      customerId
    })
    if (response.status == 201) {
      console.log('carte crée')
    } else {
      console.error(
        "Erreur lors de l'enregistrement de la carte:",
        response.data
      );
    }
  } catch (error) {
    console.log('erreur survenu', error)
  }
}
const clearStorageAndCookies = (page:string) => {
  // Clear local storage
  localStorage.clear();
  sessionStorage.clear();

  document.cookie =
    "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie =
    "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
if
  window.location.assign(page);
};

export { handlePaymentSuccess, clearStorageAndCookies, updatePaimentMethod };
