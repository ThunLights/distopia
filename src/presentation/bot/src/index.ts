import { ActivityType, type Client } from "infra-discord/prelude";

export function handleClient(client: Client) {
    client.on("clientReady", async client => {
        client.user.setActivity({
            name: `${client.guilds.cache.size}server | ${client.users.cache.size}users | distopia.top`,
            type: ActivityType.Playing
        });
    });

    client.on("interactionCreate", async interaction => {});

    client.on("messageCreate", async message => {});

    client.on("guildMemberAdd", async member => {});

    client.on("guildUpdate", async (oldGuild, newGuild) => {});

    return client;
}
