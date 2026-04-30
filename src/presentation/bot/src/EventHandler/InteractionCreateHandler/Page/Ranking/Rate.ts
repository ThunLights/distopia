import type { AppCore } from "app-core";
import { formatYMDString } from "app-core/date";
import { omitTxt } from "app-core/omit";
import { EmbedBuilder, type InteractionReplyOptions } from "discord.js";

export async function page(core: AppCore): Promise<InteractionReplyOptions> {
  const date = await formatYMDString(new Date(new Date().toLocaleDateString("ja-JP")));
  const embed = new EmbedBuilder()
    .setTitle("サーバーランキング: アクティブレート")
    .setDescription(
      `ここでは20位までしか表示されません。追加で見たい場合は[こちら](${core.state.url}/ranking?type=activeRate)にアクセスお願いします。`,
    )
    .setColor("Purple")
    .setURL(`${core.state.url}/ranking?type=activeRate`)
    .setFooter({ text: `最終更新: ${date}` });

  for (const { guild, rank } of (await core.ranking.fetchGuild("activeRate")).map(
    (guild, index) => ({
      rank: index + 1,
      guild,
    }),
  )) {
    embed.addFields({
      name: `${rank}: ${guild.name}`,
      value: `${await omitTxt((guild.description ?? "未記入").replaceAll("\n", ""), 40)}`,
    });
  }

  return {
    embeds: [embed],
    flags: [],
  };
}
