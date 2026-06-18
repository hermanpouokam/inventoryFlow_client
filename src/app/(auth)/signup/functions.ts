import { instance } from "@/components/fetch";

const handlePaymentSuccess = async (paymentIntentId: string, amount: string, planId: number, status: string, payment_method: string, interval: string) => {
  try {
    const response = await instance.post("/payments/info/", {
      plan_id: planId,
      amount: amount,
      payment_method,
      payment_intent: paymentIntentId,
      status,
      interval
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

const clearStorageAndCookies = (page: string) => {
  try {
    localStorage.clear();
    sessionStorage.clear();
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
    const authPages = ['/signup', '/signin'];
    if (!authPages.includes(page)) {
      window.location.reload();
    }
  } catch (error) {
    console.error('Erreur lors de la suppression des données locales :', error);
  }
};

function generateRandomString(length = 16) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

export { handlePaymentSuccess, clearStorageAndCookies, updatePaimentMethod,generateRandomString };
