import type { Client } from "infra-discord/prelude";

export abstract class BaseHandler<H extends (...args: any[]) => any> {
  constructor(protected readonly client: Client) {}

  public abstract handle(...args: Parameters<H>): Promise<ReturnType<H>>;
}
