import { LateLimitMapWithGC } from "./LateLimitMapWithGC";
import type { LimitDate } from "./LimitDate";

export class GuildBumpLateLimit extends LateLimitMapWithGC<string, LimitDate> {}
