import type { LimitDate } from "./LimitDate";
import { MapWithGC } from "./MapWithGC";

export class GuildBumpLateLimit extends MapWithGC<string, LimitDate> {}
