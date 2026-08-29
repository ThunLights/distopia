import type { AppCore } from "app-core";

import { Logger } from "../utils/logging/Logger";
import { WelcomeMessenger } from "../utils/welcome/WelcomeMessenger";

export abstract class BaseHandler<H extends (...args: any[]) => any> {
  protected readonly logger: Logger;
  protected readonly welcomeMessenger: WelcomeMessenger;

  constructor(protected readonly core: AppCore) {
    this.logger = new Logger(core);
    this.welcomeMessenger = new WelcomeMessenger(core);
  }

  public abstract handle(...args: Parameters<H>): Promise<ReturnType<H>>;
}
