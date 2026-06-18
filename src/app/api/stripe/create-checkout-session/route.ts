// app/api/stripe/create-checkout-session/route.ts
import { getServerAuth } from "@/lib/getServerAuth";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";
import { getStripe } from "@/lib/stripe";


export async function POST(req: NextRequest) {
    const cookieStore = await cookies();
    const stripe = getStripe();
    const accessToken = cookieStore.get("access_token")?.value;

    try {

        const auth = await getServerAuth();
        // ── 1. Authentification obligatoire ───────────────────────────────────────
        if (!auth) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        const { paymentMethodId, amount, currency, plan_id, interval } =
            await req.json();


        // ── 2. Validation des champs obligatoires ─────────────────────────────────
        if (!paymentMethodId || !amount || !plan_id || !interval) {
            return NextResponse.json(
                { error: "Champs manquants : paymentMethodId, amount, plan_id, interval, enterprise_id requis" },
                { status: 400 }
            );
        }

        if (typeof amount !== "number" || amount <= 0) {
            return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
        }

        // ── 3. Créer le PaymentIntent avec metadata complète ─────────────────────
        // Les metadata sont transmises au webhook pour identifier le plan à activer

        let customerId = auth.user.enterprise_details.stripe_customer_id
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: auth.user.email,
                metadata: { enterprise_id: String(auth.user.enterprise) },
            });
            customerId = customer.id;
        }

        const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
        const paymentIntent = await stripe.paymentIntents.create({
            amount,          // en centimes (ex: 500000 = 5000 FCFA si currency=xaf)
            currency,
            payment_method: paymentMethodId,
            confirm: true,
            setup_future_usage: 'off_session',
            customer: customerId,
            automatic_payment_methods: { enabled: true, allow_redirects: "never" },
            metadata: {
                plan_id: String(plan_id),
                interval,
                enterprise_id: String(auth.user.enterprise),
                user_email: auth.user.email ?? "",
                access_token: accessToken ?? "",
            },
        });

        // ── 4. Paiement confirmé immédiatement (cas le plus fréquent sans 3DS) ───
        if (paymentIntent.status === "succeeded") {
            // Notifier Django directement — pas besoin d'attendre le webhook
            const activated = await _activatePlanOnDjango({
                payment_ref: paymentIntent.id,
                amount: amount / 100,
                plan_id,
                interval: interval === "annual" ? "year" : "month",
                enterprise_id: String(auth.user.enterprise),
                payment_method: "stripe",
                access_token: accessToken ?? "",
            });
            const saved = await _savePaymentMethod({
                stripe_customer_id: customerId,
                stripe_payment_method_id: paymentMethodId,
                provider: "stripe",
                card_brand: pm.card?.brand ?? "",
                card_last4: pm.card?.last4 ?? "",
                card_exp: `${pm.card?.exp_month}/${pm.card?.exp_year}`,
                access_token: accessToken ?? "",

            });
            if (!activated.ok) {
                // Le paiement est passé chez Stripe mais Django a échoué
                // Logger l'erreur — le webhook servira de filet de sécurité
                console.error("[Stripe] Activation Django échouée après PaymentIntent succeeded", {
                    paymentIntentId: paymentIntent.id,
                    error: activated
                });
            }
            if (!saved.ok) {
                // Le paiement est passé chez Stripe mais Django a échoué
                // Logger l'erreur — le webhook servira de filet de sécurité
                console.error("[Stripe] ajout de la methode de payement echouee PaymentIntent succeeded", {
                    paymentIntentId: paymentIntent.id,
                    error: saved
                });
            }
            return NextResponse.json({
                success: true,
                status: "succeeded",
                paymentIntentId: paymentIntent.id,
                activated: activated.ok,
            });
        }

        // ── 5. 3DS requis — le webhook prendra le relai après confirmation ────────
        if (paymentIntent.status === "requires_action") {
            const saved = await _savePaymentMethod({
                stripe_customer_id: customerId,
                stripe_payment_method_id: paymentMethodId,
                provider: "stripe",
                card_brand: pm.card?.brand ?? "",
                card_last4: pm.card?.last4 ?? "",
                card_exp: `${pm.card?.exp_month}/${pm.card?.exp_year}`,
                access_token: accessToken ?? "",

            });

            if (!saved.ok) {
                // Le paiement est passé chez Stripe mais Django a échoué
                // Logger l'erreur — le webhook servira de filet de sécurité
                console.error("[Stripe] ajout de la methode de payement echouee PaymentIntent succeeded", {
                    paymentIntentId: paymentIntent.id,
                    error: saved
                });
            }
            return NextResponse.json({
                success: false,
                status: "requires_action",
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            });
        }

        // ── 6. Paiement refusé ou autre statut ────────────────────────────────────
        return NextResponse.json({
            success: false,
            status: paymentIntent.status,
            error: "Paiement non abouti",
        });

    } catch (error: any) {
        console.error("[Stripe] create-checkout-session error:", error);

        // Distinguer les erreurs Stripe des erreurs serveur
        if (error?.type?.startsWith("Stripe")) {
            return NextResponse.json(
                { success: false, error: error.message, code: error.code },
                { status: 402 }
            );
        }

        return NextResponse.json(
            { success: false, error: "Erreur serveur" },
            { status: 500 }
        );
    }
}

// ─── Helper : appel interne vers Django ──────────────────────────────────────
async function _activatePlanOnDjango(payload: {
    payment_ref: string;
    amount: number;
    plan_id: string | number;
    interval: string;
    enterprise_id: string | number;
    payment_method: string;
    access_token: string;
    
}): Promise<{ ok: boolean; error?: string }> {
    try {
        const res = await fetch(
            `${process.env.DJANGO_API_URL}/subscription/activate/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Secret partagé entre Next.js et Django — jamais exposé au client
                    "X-Internal-Secret": process.env.INTERNAL_WEBHOOK_SECRET!,
                    "Authorization": `Bearer ${payload.access_token}`
                },
                body: JSON.stringify({
                    ...payload,
                    status: "completed",
                }),
            }
        );

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            return { ok: false, error: body?.error ?? `HTTP ${res.status}` };
        }

        return { ok: true };
    } catch (e: any) {
        return { ok: false, error: e.message };
    }
}

async function _savePaymentMethod(payload: {
    provider: string,
    stripe_payment_method_id: string,
    stripe_customer_id: string,
    card_brand: string,
    card_last4: string,
    card_exp: string,
    access_token: string
}): Promise<{ ok: boolean; error?: string }> {
    try {
        const res = await fetch(`${process.env.DJANGO_API_URL}/payment-method/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${payload.access_token}`,
            },
            body: JSON.stringify({
                ...payload
            }),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            return { ok: false, error: body?.error ?? `HTTP ${res.status}` };
        }
        return { ok: true };
    } catch (e: any) {
        return { ok: false, error: e.message };
    }
}