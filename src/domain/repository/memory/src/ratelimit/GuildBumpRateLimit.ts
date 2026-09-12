import type { LimitDate } from "./LimitDate";
import { RateLimitMapWithGC } from "./RateLimitMapWithGC";

export class GuildBumpRateLimit extends RateLimitMapWithGC<string, LimitDate> {}
