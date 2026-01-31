import Stripe from "stripe";
import { readSecret } from "../utils/secret";

let stripeInstance: Stripe | null = null;
export function getStripeInstance() {
  if (!stripeInstance) {
    stripeInstance = new Stripe(getSecretKey(), {
      apiVersion: "2025-12-15.clover",
    });
  }
  return stripeInstance;
}

let secretKey: string | undefined = undefined;
function getSecretKey() {
  if (!secretKey) {
    secretKey =
      process.env.ENV === "production"
        ? readSecret("/run/secrets/stripe_secret_key")
        : readSecret("/run/secrets/stripe_secret_key_dev") ?? "";
  }
  console.log(secretKey, "secretKey");
  return secretKey as string;
}
