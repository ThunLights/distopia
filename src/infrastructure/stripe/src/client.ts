import Stripe from "stripe";

// The abstraction consumers (app-core, etc.) should depend on instead of the concrete `Stripe`
// SDK type directly -- same role as infra-discord's DiscordClient / repo-search's
// SearchEngineClient. Left as the full SDK surface for now since no real feature exists yet to
// say which resource namespaces it actually needs; narrow this to
// `Pick<Stripe, "checkout" | "webhooks" | ...>` once one does, the same way those two were
// narrowed from their own concrete classes. Only this file should import "stripe" directly.
export type StripeClient = Stripe;

// One client per secret key -- callers own the key's lifecycle (env var, k8s Secret, etc.);
// this package only owns how the SDK itself is configured. No safeFetch/SSRF wrapping here
// (unlike infra-http's usual role for external APIs) since the SDK talks to a fixed,
// trusted Stripe host, never a user- or DB-supplied URL.
export function createStripeClient(secretKey: string): StripeClient {
  return new Stripe(secretKey);
}
