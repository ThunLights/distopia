import { isStaff } from "app-core/staff";
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionReplyOptions,
  type MessagePayload,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  type User,
} from "shared-lib/discord.js";

import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";

type Options = {
  user: User | null;
};

export class StaffCommand extends ChatInputCommandBase<Options> {
  public override regist: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "staff",
    description: "スタッフかどうかチェックできるよ",
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: "user",
        description: "ユーザーを指定することも出来ます。",
        required: false,
      },
    ],
  };

  public override async parseOptions(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<Options> {
    return {
      user: interaction.options.getUser("user", false),
    };
  }

  protected override async exec(
    interaction: ChatInputCommandInteraction<CacheType>,
    options: Options,
  ): Promise<string | InteractionReplyOptions | MessagePayload> {
    const userId = options.user ? options.user.id : interaction.user.id;

    if (await isStaff(userId)) {
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Staff")
        .setDescription(`<@!${userId}> はスタッフです。`);

      return { embeds: [embed] };
    } else {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("No Staff")
        .setDescription(`<@!${userId}> はスタッフではありません`);
      return { embeds: [embed] };
    }
  }
}
