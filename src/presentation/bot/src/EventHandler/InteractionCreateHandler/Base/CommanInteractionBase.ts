import {
  MessageFlags,
  type CommandInteraction,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";

import { codeBlock } from "../../../utils/codeblock";
import { Base } from "./Base";

export abstract class CommandInteractionBase<
  O extends {},
  T extends CommandInteraction,
  R = string | InteractionReplyOptions | MessagePayload,
> extends Base<T, R> {
  public readonly requirePermissions: PermissionResolvable[] = [];

  public override async run(interaction: T): Promise<R> {
    if (
      !interaction.guild?.members.me
        ?.permissionsIn(interaction.channelId)
        .has(this.requirePermissions)
    ) {
      return {
        content: [
          "このコマンドの実行には以下の権限が必要です。",
          codeBlock(this.requirePermissions.join(" ")),
          "権限が足りているのに実行できない場合はボット側のインテント設定が原因の可能性が高いです。",
        ].join("\n"),
        flags: [MessageFlags.Ephemeral],
      } as R;
    }

    const options = await this.parseOptions(interaction);

    return await this.exec(interaction, options);
  }

  public abstract parseOptions(interaction: T): Promise<O>;

  protected abstract exec(interaction: T, options: O): Promise<R>;
}
