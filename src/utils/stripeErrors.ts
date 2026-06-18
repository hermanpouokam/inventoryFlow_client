// utils/stripeErrors.ts
import type { TFunction } from "i18next";

const STRIPE_ERROR_CODES = [
  "card_declined",
  "insufficient_funds",
  "expired_card",
  "incorrect_cvc",
  "incorrect_number",
  "invalid_number",
  "invalid_expiry_month",
  "invalid_expiry_year",
  "invalid_cvc",
  "do_not_honor",
  "authentication_required",
  "card_velocity_exceeded",
  "lost_card",
  "stolen_card",
  "pickup_card",
  "restricted_card",
  "security_violation",
  "service_not_allowed",
  "transaction_not_allowed",
  "try_again_later",
] as const;

type StripeErrorCode = (typeof STRIPE_ERROR_CODES)[number];

export const getStripeErrorMessage = (
  t: TFunction,
  code?: string
): string => {
  const isKnown = STRIPE_ERROR_CODES.includes(code as StripeErrorCode);
  return t(
    isKnown
      ? `stripe_errors.${code}`
      : "stripe_errors.fallback"
  );
};
