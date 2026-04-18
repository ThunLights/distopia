import { BaseHandler } from "./BaseHandler";
import type { Message, OmitPartialGroupDMChannel } from "infra-discord/prelude";

export class MessageCreateHandler extends BaseHandler<
  (message: OmitPartialGroupDMChannel<Message<boolean>>) => void
> {
  public override async handle(
    _message: OmitPartialGroupDMChannel<Message<boolean>>,
  ): Promise<void> {}
}
