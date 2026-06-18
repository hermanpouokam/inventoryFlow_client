// app/api/stripe/webhook/route.ts
import { getStripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";  // ← ajout important

export async function POST(request: NextRequest) {
  // ── 1. Lire le body brut ──────────────────────────────────────────────────
  const body = await request.text();
  const stripe = getStripe();

  if (!body) {
    console.error("[Webhook] Body vide reçu");
    return NextResponse.json({ error: "Body vide" }, { status: 400 });
  }

  // ── 2. Vérifier la signature Stripe ──────────────────────────────────────
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    console.error("[Webhook] Header stripe-signature manquant");
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("[Webhook] Signature invalide:", err.message);
    return NextResponse.json(
      { error: `Signature invalide : ${err.message}` },
      { status: 400 }
    );
  }

  console.log(`[Webhook] Événement reçu : ${event.type} (${event.id})`);

  try {
    switch (event.type) {

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await _handlePaymentSucceeded(pi);
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.error(`[Webhook] Paiement échoué : ${pi.id}`, {
          error: pi.last_payment_error?.message,
          code: pi.last_payment_error?.code,
        });
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await _handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await _notifyPaymentFailed(invoice);
        break;
      }

      default:
        console.log(`[Webhook] Événement non géré : ${event.type}`);
    }
  } catch (err: any) {
    console.error(`[Webhook] Erreur traitement ${event.type}:`, err.message);
  }

  return NextResponse.json({ received: true });
}

// ─── Handler : PaymentIntent succeeded ───────────────────────────────────────
async function _handlePaymentSucceeded(pi: Stripe.PaymentIntent) {
  const { plan_id, interval, enterprise_id, access_token } = pi.metadata ?? {};

  if (!plan_id || !enterprise_id) {
    console.error("[Webhook] Metadata manquante", { id: pi.id, metadata: pi.metadata });
    return;
  }


  const result = await _callDjangoActivate({
    payment_ref: pi.id,
    amount: pi.amount / 100,
    plan_id,
    interval: interval ?? "monthly",
    enterprise_id,
    payment_method: "stripe",
    access_token: access_token ?? "",   // token JWT si dispo (paiement direct)
  });

  if (result.ok) {
    console.log(`[Webhook] Plan activé pour enterprise ${enterprise_id}`);
  } else {
    console.error(`[Webhook] Activation échouée :`, result.error);
  }
}

// ─── Handler : Invoice paid ───────────────────────────────────────────────────
async function _handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription) {
    console.log("[Webhook] invoice.paid sans subscription — ignoré");
    return;
  }
  const stripe = getStripe();

  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  );
  const { plan_id, interval, enterprise_id } = subscription.metadata ?? {};

  if (!plan_id || !enterprise_id) {
    console.error("[Webhook] Metadata manquante sur subscription", {
      subscription_id: subscription.id,
    });
    return;
  }

  // ✅ Pas de access_token ici — appel interne via X-Internal-Secret
  await _callDjangoActivate({
    payment_ref: invoice.payment_intent as string,
    amount: invoice.amount_paid / 100,
    plan_id,
    interval: interval ?? "monthly",
    enterprise_id,
    payment_method: "stripe",
    access_token: "",   // Django utilisera X-Internal-Secret + enterprise_id
  });
}

// ─── Handler : Invoice payment failed ────────────────────────────────────────
async function _notifyPaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.customer_email) return;
  try {
    await fetch(`${process.env.DJANGO_API_URL}/payment/failed-notification/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": process.env.INTERNAL_WEBHOOK_SECRET!,
      },
      body: JSON.stringify({
        invoice_id: invoice.id,
        customer_email: invoice.customer_email,
        amount: invoice.amount_due / 100,
      }),
    });
  } catch (e) {
    console.error("[Webhook] Notification échec non envoyée:", e);
  }
}

// ─── Appel Django — supporte JWT (paiement direct) ou secret interne (webhook) ─
async function _callDjangoActivate(payload: {
  payment_ref: string;
  amount: number;
  plan_id: string;
  interval: string;
  enterprise_id: string;
  payment_method: string;
  access_token: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { access_token, ...body } = payload;

  // Auth : JWT si disponible (paiement direct), sinon secret interne (webhook)
  const authHeader = access_token
    ? `Bearer ${access_token}`
    : `Internal ${process.env.INTERNAL_WEBHOOK_SECRET}`;

  try {
    const res = await fetch(
      // ✅ DJANGO_API_URL — jamais NEXT_PUBLIC (privé côté serveur)
      `${process.env.DJANGO_API_URL}/subscription/activate/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader,
          "X-Internal-Secret": process.env.INTERNAL_WEBHOOK_SECRET!,
        },
        body: JSON.stringify({ ...body, status: "completed" }),
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data?.error ?? `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}