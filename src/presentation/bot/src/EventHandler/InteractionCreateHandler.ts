import { BaseHandler } from "./BaseHandler";
import type { CacheType, Interaction } from "infra-discord/prelude";

export class InteractionCreateHandler extends BaseHandler<
  (interaction: Interaction<CacheType>) => void
> {
  public override async handle(_interaction: Interaction<CacheType>): Promise<void> {}
}
