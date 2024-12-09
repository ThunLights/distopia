import { database, DatabaseError } from "../Database/index";
import { Client } from "discord.js";

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
        const guild = await database.guildTables.guild.id2Data(member.guild.id);
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
	}

	public async guildMemberUpdate(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember): Promise<void> {
	}
}
