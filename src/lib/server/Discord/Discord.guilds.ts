import { database, DatabaseError } from "../Database/index";
import { Client } from "discord.js";

import type { PartialGuildMember, GuildMember, Guild } from "discord.js";

export class GuildClientError {
    constructor(public readonly content: string) {
    }
}

export class GuildClient {
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
		if (guild) {
			await database.guildTables.newMember.update(guild.guildId);
		}
	}

	public async guildMemberUpdate(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember): Promise<void> {
	}
}
