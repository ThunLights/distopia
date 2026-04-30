import type { LimitDate } from "./LimitDate";
import { MapWithGC } from "./MapWithGC";

export class MessageCreateLateLimit extends MapWithGC<string, LimitDate> {}
