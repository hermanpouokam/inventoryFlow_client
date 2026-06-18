// app/api/stripe/payment-intent/route.ts
import { getServerAuth } from "@/lib/getServerAuth";
import { getStripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";



export async function POST(req: NextRequest) {
  const stripe = getStripe()
  try {
    // ── 1. Authentification obligatoire ──────────────────────────────────────
    const auth = await getServerAuth();

    if (!auth) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { paymentIntentId } = await req.json();

    if (!paymentIntentId || typeof paymentIntentId !== "string") {
      return NextResponse.json({ error: "paymentIntentId manquant" }, { status: 400 });
    }

    // ── 2. Récupérer le PaymentIntent ─────────────────────────────────────────
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["payment_method"],
    });

    // ── 3. Vérifier que ce PaymentIntent appartient à l'utilisateur connecté ──
    // On compare l'enterprise_id dans les metadata avec celui du user connecté
    const enterprise_id = paymentIntent.metadata?.enterprise_id;
    const sessionEnterpriseId = auth.user.enterprise; // adapte selon ton token

    if (!enterprise_id || String(enterprise_id) !== String(sessionEnterpriseId)) {
      console.warn("[PaymentIntent] Tentative d'accès non autorisé", {
        requested: paymentIntentId,
        enterprise_metadata: enterprise_id,
        session_enterprise: sessionEnterpriseId,
      });
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // ── 4. Extraire uniquement les données nécessaires (pas tout l'objet) ─────
    const pm = paymentIntent.payment_method as Stripe.PaymentMethod | null;

    const safeData = {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      created: paymentIntent.created,
      metadata: paymentIntent.metadata,
      // Données carte — uniquement si payment_method est expanded
      card: pm?.card
        ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          exp_month: pm.card.exp_month,
          exp_year: pm.card.exp_year,
        }
        : null,
      // Infos de facturation sans données sensibles
      billing_details: pm?.billing_details
        ? {
          name: pm.billing_details.name,
          email: pm.billing_details.email,
          // On omet l'adresse complète — rarement utile côté client
        }
        : null,
    };

    return NextResponse.json(safeData);

  } catch (error: any) {
    console.error("[PaymentIntent] Erreur:", error);

    if (error?.code === "resource_missing") {
      return NextResponse.json(
        { error: "PaymentIntent introuvable" },
        { status: 404 }
      );
    }

    if (error?.type?.startsWith("Stripe")) {
      return NextResponse.json(
        { error: error.message },
        { status: 402 }
      );
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
