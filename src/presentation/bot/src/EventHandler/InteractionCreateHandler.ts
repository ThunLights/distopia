import type { CacheType, Interaction } from "infra-discord/prelude";

import { BaseHandler } from "./BaseHandler";

export class InteractionCreateHandler extends BaseHandler<
  (interaction: Interaction<CacheType>) => void
> {
  public override async handle(_interaction: Interaction<CacheType>): Promise<void> {}
}
