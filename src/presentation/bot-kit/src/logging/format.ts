import type { ColorResolvable } from "discord.js";

export type LogEmbedField = { name: string; value: string; inline?: boolean };

export type LogContent = {
  description: string;
  image?: string;
  fields?: LogEmbedField[];
  /** Fields too long to fit alongside `fields` — sent as a follow-up message. */
  overflowFields?: LogEmbedField[];
};

export type LogFormat<Args extends unknown[] = unknown[]> = {
  title: string;
  color?: ColorResolvable;
  build: (...args: Args) => LogContent | Promise<LogContent>;
};
