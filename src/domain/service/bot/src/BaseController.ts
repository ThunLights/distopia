import type { Client } from "discord.js";

export abstract class BaseController {
    constructor(protected readonly client: Client) {}
}
