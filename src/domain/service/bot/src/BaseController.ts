import type { Client } from "infra-discord/prelude";

export abstract class BaseController {
    constructor(protected readonly client: Client) {}
}
