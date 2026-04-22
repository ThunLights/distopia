export class LateLimitError extends Error {
  constructor(
    public readonly limit: Date,
    public readonly remainTime: number,
  ) {
    super("LateLimit Error");
  }
}
