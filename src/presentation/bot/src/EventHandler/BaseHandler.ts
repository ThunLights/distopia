import type { AppCore } from "app-core";

import { Logger } from "../utils/Logger";

export abstract class BaseHandler<H extends (...args: any[]) => any> {
  protected readonly logger: Logger;

  constructor(protected readonly core: AppCore) {
    this.logger = new Logger(core);
  }

  public abstract handle(...args: Parameters<H>): Promise<ReturnType<H>>;
}
