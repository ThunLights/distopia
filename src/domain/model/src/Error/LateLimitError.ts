export class LateLimitError extends Error {
  constructor(public readonly limit: Date) {
    super("LateLimit Error");
  }
}
