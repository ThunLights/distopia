import type {
  InteractionReplyOptions,
  MessageComponentInteraction,
  MessagePayload,
} from "discord.js";

import { Base } from "./Base";

export abstract class MessageComponentInteractionBase<
  T extends MessageComponentInteraction,
  R = string | InteractionReplyOptions | MessagePayload,
> extends Base<T, R> {
  public abstract readonly customId: string;

  public override async match(interaction: T): Promise<boolean> {
    return interaction.customId === this.customId;
  }
}
