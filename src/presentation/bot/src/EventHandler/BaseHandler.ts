import type { Client } from "discord.js";

import type { AppData } from "../model";

export abstract class BaseHandler<H extends (...args: any[]) => any> {
  constructor(
    protected readonly client: Client,
    protected readonly appData: AppData,
  ) {}

  public abstract handle(...args: Parameters<H>): Promise<ReturnType<H>>;
}
