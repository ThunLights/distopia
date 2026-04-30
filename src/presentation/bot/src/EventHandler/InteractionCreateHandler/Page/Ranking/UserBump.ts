import type { AppCore } from "app-core";
import { formatYMDString } from "app-core/date";
import { EmbedBuilder, type InteractionReplyOptions } from "discord.js";

export async function page(core: AppCore): Promise<InteractionReplyOptions> {
  const date = await formatYMDString(new Date(new Date().toLocaleDateString("ja-JP")));
  const embed = new EmbedBuilder()
    .setTitle("ユーザーランキング: Bump")
    .setDescription(
      `ここでは20位までしか表示されません。追加で見たい場合は[こちら](${core.state.url}/ranking?type=userBump)にアクセスお願いします。`,
    )
    .setColor("Purple")
    .setURL(`${core.state.url}/ranking?type=userBump`)
    .setFooter({ text: `最終更新: ${date}` });

  for (const { user, rank } of (await core.ranking.fetchUser("userBump")).map((user, index) => ({
    user,
    rank: index + 1,
  }))) {
    embed.addFields({
      name: `${rank}: ${user?.displayName ?? "unknown"}`,
      value: `合計: ${user.bumpCounter}回\nユーザーネーム: ${user?.name ?? "unknown"} (ID: ${user.id})`,
    });
  }

  return {
    embeds: [embed],
    flags: [],
  };
}
