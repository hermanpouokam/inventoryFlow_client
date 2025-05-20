// import Stripe from 'stripe';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export async function POST(req) {
//     try {
//         const { amount, currency, paymentMethodId } = await req.json();

//         // Create PaymentIntent
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount,
//             currency: currency || 'usd',
//             payment_method: paymentMethodId,
//             confirm: true,
//             automatic_payment_methods: {
//                 enabled: true,
//                 allow_redirects: 'never',
//             },
//         });

//         // Check Payment Status
//         if (paymentIntent.status === 'requires_action') {
//             return Response.json({
//                 success: false,
//                 status: 'requires_action',
//                 clientSecret: paymentIntent.client_secret,
//                 paymentIntentId: paymentIntent.id   
//             });
//         } else if (paymentIntent.status === 'succeeded') {
//             return Response.json({
//                 success: true,
//                 message: 'Payment completed successfully!',
//                 paymentIntentId: paymentIntent.id
//             });
//         } else {
//             return Response.json({
//                 success: false,
//                 message: 'Payment not completed.',
//                 status: paymentIntent.status
//             });
//         }

//     } catch (error) {
//         return Response.json({ success: false, error: error.message }, { status: 400 });
//     }
// }

import Stripe from 'stripe';
  console.log("CLÉ UTILISÉE :", process.env.STRIPE_SECRET_KEY); // Ajoute ce log

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    try {
        const { paymentMethodId, email, priceId } = await req.json();

        // 1. Create or retrieve customer
        const customer = await stripe.customers.create({
            email,
            payment_method: paymentMethodId,
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });
        // 2. Create subscription for recurring payment
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            expand: ['latest_invoice.payment_intent'],
            payment_behavior: 'allow_incomplete',
        });

        const paymentIntent = subscription.latest_invoice.payment_intent;

        // 3. Handle payment status
        if (paymentIntent.status === 'requires_action') {
            return Response.json({
                success: false,
                status: 'requires_action',
                clientSecret: paymentIntent.client_secret,
                subscriptionId: subscription.id,
                paymentIntentId: paymentIntent.id,
                customerId: customer.id,
            });
        } else if (paymentIntent.status === 'succeeded') {
            return Response.json({
                success: true,
                message: 'Subscription created successfully!',
                subscriptionId: subscription.id,
                paymentIntentId: paymentIntent.id,
                customerId: customer.id
            });
        } else {
            return Response.json({
                success: false,
                message: 'Subscription creation failed.',
                status: paymentIntent.status
            });
        }

    } catch (error) {
        console.error('Stripe error:', error);
        return Response.json({ success: false, error: error.message }, { status: 400 });
    }
}
