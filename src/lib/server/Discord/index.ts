import { ActivityType, Client, REST } from "discord.js";

import { INTENTS } from "./Discord.intents";
import { InteractionClient } from "./Discord.interaction";
import { GuildClient } from "./Discord.guilds";
import { MessageClient } from "./Discord.message";

import cfg from "$project/important/discord.json";

export class DiscordBotClient {
    public readonly token = cfg.bot.token;
    public readonly clientId = cfg.bot.id;
    public readonly client = new Client({ intents: INTENTS });
    public readonly guilds = new GuildClient(this.client);
    private readonly rest = new REST({ version: "10" }).setToken(this.token);
    private readonly interactionClient = new InteractionClient(this.client);
    private readonly messageClient = new MessageClient(this.client);

    constructor() {}

    public async setEvents() {
        this.client.on("ready", async (client) => {
            client.user.setActivity({
                name: "Supported by distopia.top",
                type: ActivityType.Playing,
            })
            await this.rest.put(`/applications/${this.clientId}/commands`, {
                body: InteractionClient.commands,
            })
        });
        this.client.on("interactionCreate", async (interaction) => {
            return await this.interactionClient.create(interaction);
        });
        this.client.on("messageCreate", async (message) => {
            return await this.messageClient.create(message);
        });
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
