import type { AppCore } from "app-core";
import { EmbedBuilder, type Guild, type GuildMember, type PartialGuildMember } from "discord.js";

export const WELCOME_MESSAGE_FIELDS = ["join", "leave"] as const;

export type WelcomeMessageField = (typeof WELCOME_MESSAGE_FIELDS)[number];

export function isWelcomeMessageField(value: string): value is WelcomeMessageField {
  return (WELCOME_MESSAGE_FIELDS as readonly string[]).includes(value);
}

export const welcomeMessageLabels: Record<
  WelcomeMessageField,
  {
    shortLabel: string;
    title: string;
    description: string;
    channelField: "welcomeMessageChannel" | "leaveMessageChannel";
    contentField: "welcomeMessageContent" | "leaveMessageContent";
    color: "Green" | "Grey";
    defaultContent: string;
  }
> = {
  join: {
    shortLabel: "参加メッセージ",
    title: "入退出メッセージ: 参加",
    description: [
      "メンバーがサーバーに参加した際に送信するメッセージを設定します。チャンネルを未設定にすると通知は送信されません。",
      "内容には {user}/{username}/{server}/{membercount} が使えます。",
    ].join("\n"),
    channelField: "welcomeMessageChannel",
    contentField: "welcomeMessageContent",
    color: "Green",
    defaultContent: "{user} さんがサーバーに参加しました!ようこそ!",
  },
  leave: {
    shortLabel: "退出メッセージ",
    title: "入退出メッセージ: 退出",
    description: [
      "メンバーがサーバーから退出した際に送信するメッセージを設定します。チャンネルを未設定にすると通知は送信されません。",
      "内容には {user}/{username}/{server}/{membercount} が使えます。",
    ].join("\n"),
    channelField: "leaveMessageChannel",
    contentField: "leaveMessageContent",
    color: "Grey",
    defaultContent: "{user} さんがサーバーから退出しました。",
  },
};

function applyPlaceholders(
  template: string,
  guild: Guild,
  member: GuildMember | PartialGuildMember,
): string {
  return template
    .replaceAll("{user}", `<@${member.id}>`)
    .replaceAll("{username}", member.user?.username ?? member.id)
    .replaceAll("{server}", guild.name)
    .replaceAll("{membercount}", `${guild.memberCount}`);
}

export async function sendWelcomeMessage(
  core: AppCore,
  guild: Guild,
  member: GuildMember | PartialGuildMember,
  field: WelcomeMessageField,
): Promise<void> {
  try {
    const label = welcomeMessageLabels[field];
    const settings = await core.guild.getSetting(guild.id);
    const channelId = settings?.[label.channelField];

    if (!channelId) {
      return;
    }

    const channel = guild.channels.cache.get(channelId);

    if (!channel?.isSendable()) {
      return;
    }

    const template = settings?.[label.contentField] || label.defaultContent;
    const description = applyPlaceholders(template, guild, member);

    const embed = new EmbedBuilder().setColor(label.color).setDescription(description);

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(`Failed to send welcome message for ${field}:`, error);
  }
}
