import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    const payload = await req.text();
    const sig = req.headers.get('stripe-signature');

    try {
        const event = stripe.webhooks.constructEvent(
            payload,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        if (event.type === 'checkout.session.completed') {
            console.log('Payment successful:', event.data.object);
        }

        return new Response('Webhook received', { status: 200 });
    } catch (error) {
        return new Response(`Webhook error: ${error.message}`, { status: 400 });
    }
}
