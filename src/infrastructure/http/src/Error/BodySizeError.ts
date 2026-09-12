/**
 * Returned by `safeFetch` when the response body exceeds the allowed size
 * limit (`MAX_BYTES`, 1MB).
 */
export class BodySizeError extends Error {}
