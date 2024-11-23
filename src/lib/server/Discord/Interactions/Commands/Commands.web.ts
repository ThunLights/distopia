import { ChannelType, ChatInputCommandInteraction, Client, EmbedBuilder } from "discord.js";
import { CommandsBase, CommandsError } from "./Commands.base";
import { database, DatabaseError } from "$lib/server/Database";

import type { CacheType, InteractionReplyOptions, MessagePayload } from "discord.js";

export class WebCommands extends CommandsBase {
    public readonly commandName = "web";
    public changeInviteRateLimit: string[] = [];

    constructor(client: Client) {
        super(client);
    }

    async commands(interaction: ChatInputCommandInteraction<CacheType>): Promise<string | MessagePayload | InteractionReplyOptions | CommandsError | null> {
        const commandName = interaction.options.getSubcommand();
        if (!(interaction.guildId && interaction.guild)) {
            return new CommandsError("GUILD_ID_NOT_FOUND");
        }

        if (commandName === "register") {
            if (!(interaction.channel && interaction.channel.type === ChannelType.GuildText)) {
                return { content: "テキストチャンネル以外に招待リンクを設定することはできません", ephemeral: true } satisfies InteractionReplyOptions;
            }
            const guild = await database.guildTables.guild.id2Data(interaction.guildId);
            if (guild instanceof DatabaseError) {
                return { content: "登録チェック時にデータベースエラーが発生しました。", ephemeral: true } satisfies InteractionReplyOptions;
            }
            if (guild) {
                return { content: "正式登録が済んでいます。", ephemeral: true } satisfies InteractionReplyOptions;
            }
            const invite = await interaction.channel.createInvite({
                maxAge: 0,
                maxUses: 0,
            });
            const result = await database.guildTables.tmp.update({
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                name: interaction.guild.name,
                invite: invite.code,
                icon: interaction.guild.icon ?? undefined,
                banner: interaction.guild.banner ?? undefined,
            });
            if (!result) {
                return { content: "データベースへの書き込みがうまく行きませんでした", ephemeral: true } satisfies InteractionReplyOptions;
            }
            const embed = new EmbedBuilder()
                .setColor("Gold")
                .setTitle("サーバーの仮登録に成功しました。")
                .setDescription(`現在招待リンクは、このチャンネルに設定されています。正式登録後に変えることが出来ます。`)
                .setFields(
                    { name: "本登録について", value: "本登録は https://distopia.top/ にて行う事が出来ます。" }
                );
            return { embeds: [ embed ] } satisfies InteractionReplyOptions;
        }
        if (commandName === "invite") {
            const guild = await database.guildTables.guild.id2Data(interaction.guildId);
            if (guild instanceof DatabaseError) {
                return { content: "データベースエラー", ephemeral: true } satisfies InteractionReplyOptions;
            }
            if (!guild) {
                return { content: `サーバーが本登録されていません。\n詳しくは\`/help\`のコマンドを使用してく確認してください`, ephemeral: true } satisfies InteractionReplyOptions;
            }
            if (this.changeInviteRateLimit.includes(interaction.guildId)) {
                return { content: "頻繁にサーバー招待URLを変えることはできません", ephemeral: true } satisfies InteractionReplyOptions;
            }
            if (!(interaction.channel && interaction.channel.isTextBased() && interaction.channel.type === ChannelType.GuildText)) {
                return { content: "テキストチャンネルでのみ招待リンクを設定することが出来ます。", ephemeral: true } satisfies InteractionReplyOptions;
            }
            const invite = await interaction.channel.createInvite({
                maxAge: 0,
                maxUses: 0,
            });
            const result = await database.guildTables.guild.update({...guild, ...{ invite: invite.code }});
            if (!result) {
                return { content: "データベースの更新が出来ませんでした。", ephemeral: true } satisfies InteractionReplyOptions;
            }
            this.changeInviteRateLimit.push(interaction.guildId);
            setTimeout(() => {
                this.changeInviteRateLimit = this.changeInviteRateLimit.filter(value => value !== interaction.guildId);
            }, 10 * 60 * 1000)
            const embed = new EmbedBuilder()
                .setColor("Gold")
                .setTitle("招待リンクを更新しました。")
                .setDescription("このチャンネルに新しく招待リンクを作成しました。")
                .addFields(
                    { name: "新しい招待リンク", value: `https://discord.gg/${invite.code}` }
                );
            return { embeds: [ embed ] } satisfies InteractionReplyOptions;
        }
        if (commandName === "page") {
            const guild = await database.guildTables.guild.id2Data(interaction.guildId);
            if (guild instanceof DatabaseError || guild === null) {
                return { content: "サーバーが見つかりませんでした。正式登録が済んでいるか確認してみてください。", ephemeral: true } satisfies InteractionReplyOptions;
            }
            if (guild) {
                return { content: `https://distopia.top/guilds/${guild.guildId}` } satisfies InteractionReplyOptions;
            }
        }

        return null;
    }
}
