'use client';

import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements, } from '@stripe/react-stripe-js';
import { useEffect } from 'react';

export default function CustomCardForm({ onChange }) {
    const stripe = useStripe();
    const elements = useElements();

    useEffect(() => {
        onChange({ stripe, elements });
    }, [stripe, elements, onChange]);

    // Custom styling for Stripe Elements
    const CARD_OPTIONS = {
        style: {
            base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a',
            },
        },
    };

    return (
        <div className="p-4 rounded-lg bg-white ">
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Numero de carte</label>
                <div className="border border-gray-300 rounded-lg p-2">
                    <CardNumberElement options={CARD_OPTIONS} />
                </div>
            </div>

            <div className="mb-4 flex gap-2">
                <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date d'expiration</label>
                    <div className="border border-gray-300 rounded-lg p-2">
                        <CardExpiryElement options={CARD_OPTIONS} />
                    </div>
                </div>

                <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                    <div className="border border-gray-300 rounded-lg p-2">
                        <CardCvcElement options={CARD_OPTIONS} />
                    </div>
                </div>
            </div>
        </div>
    );
}
