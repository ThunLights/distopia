import { ActivityType, Client, PermissionsBitField, REST } from "discord.js";

import { INTENTS } from "./Discord.intents";
import { InteractionClient } from "./Discord.interaction";
import { GuildClient } from "./Discord.guilds";
import { MessageClient } from "./Discord.message";
import { VoiceClient } from "./Discord.voice";
import { ActiveRateClient } from "./Discord.activeRate";
import { RankingClient } from "./Discord.ranking";
import { Controller } from "./Controller/index";

import { config } from "$lib/server/config";
import { PUBLIC_BOARD_OF_DIRECTORS_ROLE_ID, PUBLIC_HOME_SERVER_ID, PUBLIC_SPECIAL_BOARD_OF_DIRECTORS_ROLE_ID, PUBLIC_SUB_BOARD_OF_DIRECTORS_ROLE_ID } from "$env/static/public";
import { errorHandling } from "$lib/server/error";
import { deDepulication } from "$lib/array";
import { database } from "$lib/server/Database/index";
import { DangerousPeopleClient } from "./Discord.dangerousPeople";

export class DiscordBotClient {
    public readonly token = config.bot.token;
    public readonly clientId = config.bot.id;
    public readonly client = new Client({ intents: INTENTS });
    public readonly guilds = new GuildClient(this.client);
	public readonly control = new Controller(this.client);
    private readonly rest = new REST({ version: "10" }).setToken(this.token);
    private readonly interactionClient = new InteractionClient(this.client);
    private readonly messageClient = new MessageClient(this.client);
	private readonly voiceClient = new VoiceClient(this.client);
	private readonly activeRateClient = new ActiveRateClient(this.client);
	private readonly rankingClient = new RankingClient(this.client);
	private readonly dangerousPeople = new DangerousPeopleClient(this.client);

	private changeActivityInterval() {
		setInterval(() => {
			if (this.client.user) {
				this.client.user.setActivity({
					name: `${this.client.guilds.cache.size}server | ${this.client.users.cache.size}users | distopia.top`,
					type: ActivityType.Playing,
				});
			}
		}, 10 * 1000);
	}

	private async updateHomeServerSpecialRole() {
		try {
			const targets: string[] = [];
			const homeServer = await this.client.guilds.fetch(PUBLIC_HOME_SERVER_ID);
			const serverIds = await database.guildTables.activeRate.ranking(10);
			const existingUsers = Array.from(homeServer.members.cache.filter(member => member.roles.cache.has(PUBLIC_SPECIAL_BOARD_OF_DIRECTORS_ROLE_ID)).values());

			for (const serverId of serverIds) {
				const guild = this.client.guilds.cache.get(serverId.guildId);
				if (guild) {
					const owner = await database.guildTables.settings.owner.fetch(serverId.guildId);
					targets.push(owner ? owner.userId : guild.ownerId);
				}
			}
			for (const target of targets) {
				const user = homeServer.members.cache.get(target);
				if (user) {
					await user.roles.add(PUBLIC_SPECIAL_BOARD_OF_DIRECTORS_ROLE_ID);
				}
			}
			for (const existingUser of existingUsers) {
				if (!targets.includes(existingUser.user.id)) {
					await existingUser.roles.remove(PUBLIC_SPECIAL_BOARD_OF_DIRECTORS_ROLE_ID);
				}
			}
		} catch (error) {
			errorHandling(error);
		}
	}

	private async updateHomeServerRoles() {
		try {
			const owners: string[] = [];
			const admins: string[] = [];

			const homeServer = await this.client.guilds.fetch(PUBLIC_HOME_SERVER_ID);
			const guilds = (await database.guildTables.activeRate.ranking(50))
				.map(({ guildId }) => this.client.guilds.cache.get(guildId))
				.filter(guild => !(typeof guild === "undefined"));
			const existingOwnerUsers = Array.from(homeServer.members.cache.filter(member => member.roles.cache.has(PUBLIC_BOARD_OF_DIRECTORS_ROLE_ID)).values());
			const existingAdminUsers = Array.from(homeServer.members.cache.filter(member => member.roles.cache.has(PUBLIC_SUB_BOARD_OF_DIRECTORS_ROLE_ID)).values());

			for await (const guild of guilds) {
				const owner = await database.guildTables.settings.owner.fetch(guild.id);
				owners.push(owner ? owner.userId : guild.ownerId);
				const adminMembers = guild.members.cache
					.filter(member => member.permissions.has(PermissionsBitField.Flags.Administrator))
					.values().toArray();
				for (const adminMember of adminMembers) {
					admins.push(adminMember.user.id);
				}
			}
			for (const owner of deDepulication(owners)) {
				const user = homeServer.members.cache.get(owner);
				if (user) {
					await user.roles.add(PUBLIC_BOARD_OF_DIRECTORS_ROLE_ID);
				}
			}
			for (const admin of deDepulication(admins)) {
				const user = homeServer.members.cache.get(admin);
				if (user) {
					await user.roles.add(PUBLIC_SUB_BOARD_OF_DIRECTORS_ROLE_ID);
				}
			}

			for (const member of existingOwnerUsers) {
				if (!owners.includes(member.user.id)) {
					await member.roles.remove(PUBLIC_BOARD_OF_DIRECTORS_ROLE_ID);
				}
			}
			for (const member of existingAdminUsers) {
				if (!admins.includes(member.user.id)) {
					await member.roles.remove(PUBLIC_SUB_BOARD_OF_DIRECTORS_ROLE_ID);
				}
			}
		} catch (error) {
			errorHandling(error);
		}
	}

	public async update() {
		await this.updateHomeServerRoles();
		await this.updateHomeServerSpecialRole();
		await this.voiceClient.levelUpdate();
		await this.activeRateClient.update();
		await this.rankingClient.udpate();
		await this.rankingClient.updatePanel();
		await this.dangerousPeople.updatePanel();
	}

    public async setEvents() {
        this.client.on("ready", async (client) => {
			client.user.setActivity({
				name: `${this.client.guilds.cache.size}server | ${this.client.users.cache.size}users | distopia.top`,
				type: ActivityType.Playing,
			});
            await this.rest.put(`/applications/${this.clientId}/commands`, {
                body: InteractionClient.commands,
            });
			this.changeActivityInterval();
        });
        this.client.on("interactionCreate", async (interaction) => {
            return await this.interactionClient.create(interaction);
        });
        this.client.on("messageCreate", async (message) => {
            return await this.messageClient.create(message);
        });
		this.client.on("guildMemberAdd", async (member) => {
			return await this.guilds.guildMemberAdd(member);
		})
        this.client.on("guildUpdate", async (oldGuild, newGuild) => {
            return await this.guilds.guildUpdate(oldGuild, newGuild);
        });
		this.client.on("guildMemberUpdate", async (oldMember, newMember) => {
			return await this.guilds.guildMemberUpdate(oldMember, newMember);
		});
    }

    public async login(): Promise<void> {
        await this.client.login(this.token)
    }

    public async logout(): Promise<void> {
        await this.client.destroy();
    }
}
