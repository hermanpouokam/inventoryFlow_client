import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId }: { paymentIntentId: string } = await req.json();

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge.payment_method_details"],
    });
    const charge = paymentIntent.latest_charge as any;
    const card = charge.payment_method_details.card;

    return NextResponse.json({
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      payment_method: paymentIntent.payment_method,
      customer: paymentIntent.customer,
      billing_details:
        (paymentIntent.latest_charge as any)?.billing_details || null,
      card,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve PaymentIntent: " + error.message },
      { status: 500 }
    );
  }
}