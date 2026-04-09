import { Client } from "discord.js";
import { INTENTS } from "./intents";

export function genClient(): Client {
    return new Client({ intents: INTENTS })
}
