import type { AppCore } from "app-core";
import type { Guild, GuildMember, PartialGuildMember } from "discord.js";

export const WELCOME_MESSAGE_FIELDS = ["join", "leave"] as const;

export type WelcomeMessageField = (typeof WELCOME_MESSAGE_FIELDS)[number];

export type WelcomeMessageLabel = {
  shortLabel: string;
  title: string;
  description: string;
  channelField: "welcomeMessageChannel" | "leaveMessageChannel";
  contentField: "welcomeMessageContent" | "leaveMessageContent";
  defaultContent: string;
};

// Mirrors Logger's shape (injected core, resolves the guild's configured channel, sends,
// swallows/logs failures) since it's the same "guild announcement" responsibility, just for
// join/leave messages instead of moderation log events.
export class WelcomeMessenger {
  public static readonly FIELDS = WELCOME_MESSAGE_FIELDS;

  public static readonly labels: Record<WelcomeMessageField, WelcomeMessageLabel> = {
    join: {
      shortLabel: "参加メッセージ",
      title: "入退出メッセージ: 参加",
      description: [
        "メンバーがサーバーに参加した際に送信するメッセージを設定します。チャンネルを未設定にすると通知は送信されません。",
        "内容には {user}/{username}/{server}/{membercount} が使えます。",
      ].join("\n"),
      channelField: "welcomeMessageChannel",
      contentField: "welcomeMessageContent",
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
      defaultContent: "{user} さんがサーバーから退出しました。",
    },
  };

  public static isField(value: string): value is WelcomeMessageField {
    return (WELCOME_MESSAGE_FIELDS as readonly string[]).includes(value);
  }

  constructor(private readonly core: AppCore) {}

  public async send(
    guild: Guild,
    member: GuildMember | PartialGuildMember,
    field: WelcomeMessageField,
  ): Promise<void> {
    try {
      const label = WelcomeMessenger.labels[field];
      const settings = await this.core.guild.getSetting(guild.id);
      const channelId = settings?.[label.channelField];

      if (!channelId) {
        return;
      }

      const channel = guild.channels.cache.get(channelId);

      if (!channel?.isSendable()) {
        return;
      }

      const template = settings?.[label.contentField] || label.defaultContent;
      const content = this.applyPlaceholders(template, guild, member);

      await channel.send({ content });
    } catch (error) {
      console.error(`Failed to send welcome message for ${field}:`, error);
    }
  }

  private applyPlaceholders(
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
}
