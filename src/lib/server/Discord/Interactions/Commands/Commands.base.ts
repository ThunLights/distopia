import { Client } from "discord.js";

export abstract class CommandsBase {
    constructor(private readonly client: Client) {}

    protected async commands(): Promise<void> {
        return
    }
}
