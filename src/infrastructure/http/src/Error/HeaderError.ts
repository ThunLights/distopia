/**
 * Returned by `safeFetch` when a redirect response is missing its
 * `Location` header, the header isn't a parseable URL, or the redirect
 * target isn't an http(s) URL.
 */
export class HeaderError extends Error {}
