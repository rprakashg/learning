import Stripe from "stripe";

// Proxy defers Stripe construction (which validates the API key) to first use,
// so the module can be imported during next build without STRIPE_SECRET_KEY set.
let _stripe: Stripe | undefined;
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    _stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-04-22.dahlia",
      typescript: true,
    });
    const val = Reflect.get(_stripe, prop, _stripe);
    return typeof val === "function" ? val.bind(_stripe) : val;
  },
});
