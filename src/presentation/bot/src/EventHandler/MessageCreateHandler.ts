import type { Message, OmitPartialGroupDMChannel } from "infra-discord/prelude";

import { BaseHandler } from "./BaseHandler";

export class MessageCreateHandler extends BaseHandler<
  (message: OmitPartialGroupDMChannel<Message<boolean>>) => void
> {
  public override async handle(
    _message: OmitPartialGroupDMChannel<Message<boolean>>,
  ): Promise<void> {}
}
