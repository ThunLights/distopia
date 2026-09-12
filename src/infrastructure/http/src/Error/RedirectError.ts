/**
 * Returned by `safeFetch` when a redirect chain exceeds
 * `DEFAULT_MAX_REDIRECT` (10) hops.
 */
export class RedirectError extends Error {}
