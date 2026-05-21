import { LateLimitMapWithGC } from "./LateLimitMapWithGC";
import type { LimitDate } from "./LimitDate";

export class UserBumpLateLimit extends LateLimitMapWithGC<string, LimitDate> {}
