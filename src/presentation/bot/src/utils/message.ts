import type { AppCore } from "app-core";
import { EmbedBuilder, type Message, type OmitPartialGroupDMChannel } from "discord.js";

async function logAntiRaidTrigger(
  settings: Awaited<ReturnType<AppCore["guild"]["getSetting"]>>,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  inviteLinks: string[],
): Promise<void> {
  const logChannelId = settings?.logAntiRaid;

  if (!logChannelId || !message.guild) {
    return;
  }

  const channel = message.guild.channels.cache.get(logChannelId);

  if (!channel?.isSendable()) {
    return;
  }

  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle("荒らし対策: 招待リンクを検知しました")
    .setDescription(
      [
        `ユーザー: <@${message.author.id}> (${message.author.id})`,
        `チャンネル: <#${message.channelId}>`,
        `検知したリンク: ${inviteLinks.join(", ")}`,
      ].join("\n"),
    )
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}

export async function detectSpamMessage(
  core: AppCore,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
): Promise<boolean> {
  const content = message.content;

  if (!message.guildId) {
    return false;
  }

  const settings = await core.guild.getSetting(message.guildId);

  if (settings?.inviteLinkBlock && !message.member?.permissions.has("Administrator")) {
    const targetIds = [
      message.author.id,
      message.channelId,
      ...(message.member?.roles.cache.map((role) => role.id) ?? []),
    ];

    if (await core.guild.isWhiteListed(message.guildId, targetIds, "InviteLinkBlock")) {
      return false;
    }

    const inviteLinks = await core.message.includeInviteLink(content);
    if (inviteLinks.length) {
      if (message.deletable) {
        await message.delete();
      }
      await logAntiRaidTrigger(settings, message, inviteLinks);
      return true;
    }

    const embedInviteLinks = await core.state.discord.embed.detectInviteLinks(message.embeds);
    if (embedInviteLinks.length) {
      const messages = message.channel.messages.cache
        .values()
        .toArray()
        .filter((msg) => msg.author.id === message.author.id);

      for (const msg of messages) {
        for (const inviteLink of embedInviteLinks) {
          if (msg.content.includes(inviteLink) && msg.deletable) {
            await msg.delete();
          }
        }
      }

      if (message.deletable) {
        await message.delete();
      }

      await logAntiRaidTrigger(settings, message, embedInviteLinks);

      return true;
    }
  }

  return false;
}
