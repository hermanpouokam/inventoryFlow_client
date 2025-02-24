"use client";

import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export async function createCheckoutSession(name, currency, amount) {
  const stripe = await stripePromise;
  const response = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, currency, amount }),
  });
  const { sessionId } = await response.json();

  if (sessionId) {
    stripe?.redirectToCheckout({ sessionId });
  }
}
