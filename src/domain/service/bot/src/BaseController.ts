import type { Client } from "shared-lib/discord.js";

export abstract class BaseController {
    constructor(protected readonly client: Client) {}
}
