export class RateLimitError extends Error {
  constructor(public readonly limit: Date) {
    super("RateLimit Error");
  }
}
