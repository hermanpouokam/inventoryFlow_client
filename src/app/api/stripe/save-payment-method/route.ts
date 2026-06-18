// app/api/stripe/save-payment-method/route.ts

import { getServerAuth } from "@/lib/getServerAuth";
import { getStripe } from "@/lib/stripe";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const stripe = getStripe();
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const auth = await getServerAuth();

    if (!auth) {
        return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { setupIntentId } = await req.json();

    if (!setupIntentId || typeof setupIntentId !== "string") {
        return NextResponse.json({ error: "setupIntentId manquant" }, { status: 400 });
    }

    // 1. Vérifier que le SetupIntent est bien "succeeded" côté Stripe
    //    (évite d'enregistrer une carte non validée si le client manipule la requête)
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    if (setupIntent.status !== "succeeded") {
        return NextResponse.json(
            { error: "La carte n'a pas pu être vérifiée. Statut : " + setupIntent.status },
            { status: 400 }
        );
    }

    // 2. Vérifier que ce SetupIntent appartient bien au customer de l'enterprise connectée
    const expectedCustomerId = auth.user.enterprise_details?.stripe_customer_id;
    if (expectedCustomerId && setupIntent.customer !== expectedCustomerId) {
        console.warn("[save-payment-method] Tentative d'enregistrement non autorisée", {
            session_customer: expectedCustomerId,
            intent_customer: setupIntent.customer,
        });
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // 3. Récupérer les données de la carte directement depuis Stripe
    //    (on ne fait pas confiance au client pour ces métadonnées)
    const paymentMethodId = setupIntent.payment_method as string;
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);

    const card_brand = pm.card?.brand ?? "";
    const card_last4 = pm.card?.last4 ?? "";
    const card_exp   = `${pm.card?.exp_month}/${pm.card?.exp_year}`;

    // 4. Définir comme méthode de paiement par défaut sur le customer Stripe
    await stripe.customers.update(expectedCustomerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
    });

    // 5. Sauvegarder dans Django
    const res = await fetch(`${process.env.DJANGO_API_URL}/payment-method/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            provider: "stripe",
            stripe_payment_method_id: paymentMethodId,
            stripe_customer_id: expectedCustomerId,
            card_brand,
            card_last4,
            card_exp,
        }),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return NextResponse.json(
            { error: body?.error ?? "Erreur lors de la sauvegarde." },
            { status: 502 }
        );
    }

    return NextResponse.json({ success: true });
}
