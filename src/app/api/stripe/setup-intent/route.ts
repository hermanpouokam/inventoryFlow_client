// app/api/stripe/setup-intent/route.ts

import { getServerAuth } from "@/lib/getServerAuth";
import { getStripe } from "@/lib/stripe";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import API_URL from "@/config";

export async function POST() {
    const stripe = getStripe();
    const auth = await getServerAuth();

    if (!auth) {
        return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    let customerId = auth.user.enterprise_details?.stripe_customer_id;

    // Créer le customer Stripe s'il n'existe pas encore
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: auth.user.email,
            metadata: { enterprise_id: String(auth.user.enterprise) },
        });
        customerId = customer.id;

        // Persister le nouveau customerId dans Django immédiatement
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("access_token")?.value;

        await fetch(`${process.env.DJANGO_API_URL}/enterprise/update/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ stripe_customer_id: customerId }),
        });
    }

    // Créer le SetupIntent avec usage off_session :
    // Stripe va envoyer une autorisation à $0 pour vérifier la carte,
    // et déclencher le 3DS si la banque l'exige.
    // La carte sera pré-authentifiée pour les débits futurs off-session.
    const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        usage: "off_session",
        automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
}
