import { EmbedBuilder, type ColorResolvable, type InteractionReplyOptions } from "discord.js";

export function ttsEmbed(
  color: ColorResolvable,
  title: string,
  description: string,
): InteractionReplyOptions {
  return {
    embeds: [new EmbedBuilder().setColor(color).setTitle(title).setDescription(description)],
  };
}
