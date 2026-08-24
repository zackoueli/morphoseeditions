import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeSingleton) return stripeSingleton;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  stripeSingleton = new Stripe(key);
  return stripeSingleton;
}

export const SHIPPING_FLAT_RATE_CENTS = 450;
