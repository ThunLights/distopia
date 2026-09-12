/**
 * Returned by `safeFetch`/`safeFetchForDiscord` when a target URL (or a
 * redirect hop) resolves to a private/local IP address — this is the SSRF
 * guard blocking requests into the internal network.
 */
export class LocalAddressError extends Error {}
