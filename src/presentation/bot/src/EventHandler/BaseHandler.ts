import type { AppCore } from "app-core";

export abstract class BaseHandler<H extends (...args: any[]) => any> {
  constructor(protected readonly core: AppCore) {}

  public abstract handle(...args: Parameters<H>): Promise<ReturnType<H>>;
}
