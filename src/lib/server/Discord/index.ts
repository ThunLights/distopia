import { ActivityType, Client, REST } from "discord.js";

import { INTENTS } from "./Discord.intents";
import { InteractionClient } from "./Discord.interaction";
import { GuildClient } from "./Discord.guilds";
import { MessageClient } from "./Discord.message";
import { VoiceClient } from "./Discord.voice";
import { ActiveRateClient } from "./Discord.activeRate";
import { RankingClient } from "./Discord.ranking";
import { Controller } from "./Controller/index";

import { config } from "$lib/server/config";

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

    constructor() {
		setInterval(async () => {
			await this.voiceClient.levelUpdate();
			await this.activeRateClient.update();
			await this.rankingClient.udpate();
		}, 20 * 60 * 1000);
	}

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
