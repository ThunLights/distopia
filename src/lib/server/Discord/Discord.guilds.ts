import { database, DatabaseError } from "../Database/index";
import { ChannelType, Client, EmbedBuilder } from "discord.js";

import type { PartialGuildMember, GuildMember, Guild } from "discord.js";

type LateLimit = {
	user: string[]
	guild: string[]
}

export class GuildClientError {
    constructor(public readonly content: string) {
    }
}

export class GuildClient {
	private lateLimits: LateLimit = {
		user: [],
		guild: [],
	};

    constructor(private readonly client: Client) {
    }

    public get guilds() {
        return this.client.guilds.cache;
    }

    public async guildUpdate(oldGuild: Guild, newGuild: Guild): Promise<void> {
        const guild = await database.guildTables.guild.id2Data(oldGuild.id);
        if (guild instanceof DatabaseError) {
            return;
        }
        if (guild) {
			if (oldGuild.name !== newGuild.name) {
				await database.guildTables.guild.update({...guild, ...{ name: newGuild.name }});
			}
            if (oldGuild.icon !== newGuild.icon) {
                await database.guildTables.guild.update({...guild, ...{ icon: newGuild.icon }})
            }
            if (oldGuild.banner !== newGuild.banner) {
                await database.guildTables.guild.update({...guild, ...{ banner: newGuild.banner }})
            }
        }
    }

	public async guildMemberAdd(member: GuildMember): Promise<void> {
		try {
			const dangerousPeople = await database.dangerousPeople.fetch(member.user.id);
			const guild = await database.guildTables.guild.id2Data(member.guild.id);

			if (dangerousPeople) {
				const notice = await database.guildTables.settings.dangerousPeople.notice.fetch(member.guild.id);
				const ban = await database.guildTables.settings.dangerousPeople.ban.fetch(member.guild.id);
				const isBanUser = ban && ban.score <= dangerousPeople.score;
				const registeredChannels = notice ? this.client.channels.cache.get(notice.channelId) : null;
				const channel = registeredChannels && registeredChannels.type === ChannelType.GuildText ? registeredChannels : member.guild.systemChannel;
				const embed = new EmbedBuilder()
					.setColor("Red")
					.setTitle("危険人物の加入を検知")
					.setDescription(`「${member.user.username}(ID: ${member.user.id})」は危険人物に登録されています。`)
					.addFields(
						{ name: "詳細情報", value: `通称: ${dangerousPeople.name}, 理由: ${dangerousPeople.title}`, inline: false },
						{ name: "危険度スコア", value: `${dangerousPeople.score}(${isBanUser ? "BAN対象" : "BAN対象外"})`, inline: false },
						{ name: "詳しい説明", value: dangerousPeople.description, inline: false },
					);

				if (channel) {
					await channel.send({ embeds: [ embed ] });
				}
				if (isBanUser) {
					await member.ban();
				}
				return;
			}

			//登録サーバー専用
			if (guild instanceof DatabaseError) {
				return;
			}
			if (guild && !(this.lateLimits.user.includes(member.id) || this.lateLimits.guild.includes(member.guild.id))) {
				if (!this.lateLimits.user.includes(member.id)) this.lateLimits.user.push(member.id);
				if (!this.lateLimits.guild.includes(member.guild.id)) this.lateLimits.guild.push(member.guild.id);
				await database.guildTables.newMember.update(guild.guildId);
				setTimeout(() => {
					this.lateLimits.user = this.lateLimits.user.filter(value => value !== member.id);
					this.lateLimits.guild = this.lateLimits.guild.filter(value => value !== member.guild.id);
				}, 16 * 1000);
			}
		} catch {
			return;
		}
	}

	public async guildMemberUpdate(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember): Promise<void> {
	}
}
