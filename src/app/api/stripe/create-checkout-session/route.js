import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    try {
        const { amount, currency, paymentMethodId } = await req.json();

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: currency || 'usd',
            payment_method: paymentMethodId,
            confirm: true,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never',
            },
        });

        // Check Payment Status
        if (paymentIntent.status === 'requires_action') {
            return Response.json({
                success: false,
                status: 'requires_action',
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id   // Add this line
            });
        } else if (paymentIntent.status === 'succeeded') {
            return Response.json({
                success: true,
                message: 'Payment completed successfully!',
                paymentIntentId: paymentIntent.id   // Add this line
            });
        } else {
            return Response.json({
                success: false,
                message: 'Payment not completed.',
                status: paymentIntent.status
            });
        }

    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 400 });
    }
}
