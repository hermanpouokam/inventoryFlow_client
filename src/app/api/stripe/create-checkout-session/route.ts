import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
    try {
        const { paymentMethodId, email, interval, amount, currency } = await req.json();


        // 🎯 2️⃣ Créer le PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method: paymentMethodId,
            confirm: true,
            automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
            metadata: {
                email,
                interval,
            },
        });

        // 🎯 3️⃣ Gérer les statuts
        if (paymentIntent.status === "requires_action") {
            return Response.json({
                success: false,
                status: "requires_action",
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            });
        }

        if (paymentIntent.status === "succeeded") {
            return Response.json({
                success: true,
                message: "Payment successful!",
                paymentIntentId: paymentIntent.id,
            });
        }

        return Response.json({
            success: false,
            message: "Payment failed",
            status: paymentIntent.status,
        });

    } catch (error: any) {
        console.error("Stripe error:", error);
        return Response.json({ success: false, error: error.message }, { status: 400 });
    }
}