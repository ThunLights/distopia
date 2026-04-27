import type { Client } from "discord.js";

export abstract class Base {
  constructor(protected readonly client: Client) {}
}
