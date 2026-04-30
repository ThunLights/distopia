import { LateLimitMapWithGC } from "./LateLimitMapWithGC";
import type { LimitDate } from "./LimitDate";

export class MessageCreateLateLimit extends LateLimitMapWithGC<string, LimitDate> {}
