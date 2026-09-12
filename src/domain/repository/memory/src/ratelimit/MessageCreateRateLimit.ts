import type { LimitDate } from "./LimitDate";
import { RateLimitMapWithGC } from "./RateLimitMapWithGC";

export class MessageCreateRateLimit extends RateLimitMapWithGC<string, LimitDate> {}
