// app/api/webhook/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  console.log("🔔 Webhook received (Step 1/4)");

  // 1. Vérifier la méthode HTTP
  if (request.method !== 'POST') {
    console.log("❌ Method not allowed");
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  // 2. Lire le corps de la requête
  const body = await request.text();
  console.log("📦 Raw body:", body.substring(0, 100) + "...");

  // 3. Vérifier la signature Stripe
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    console.log("❌ Missing stripe-signature header");
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("🎉 Event successfully verified:", event.type);

    // 4. Traiter l'événement
    switch (event.type) {
      case 'invoice.paid':
        console.log("💳 Invoice paid:", event.data.object.id);
        break;
      default:
        console.log("🤷 Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.log("❌ Webhook error:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }
}