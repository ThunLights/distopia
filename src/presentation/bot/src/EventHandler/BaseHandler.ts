import type { AppData } from "app-core/AppData";

export abstract class BaseHandler<H extends (...args: any[]) => any> {
  constructor(protected readonly appData: AppData) {}

  public abstract handle(...args: Parameters<H>): Promise<ReturnType<H>>;
}
