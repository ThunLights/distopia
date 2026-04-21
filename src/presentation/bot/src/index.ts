import type { AppData } from "app-core/AppData";
import { ActivityType, type Client } from "discord.js";

import { GuildMemberAdd } from "./EventHandler/GuildMemberAdd";
import { GuildUpdate } from "./EventHandler/GuildUpdate";
import { InteractionCreateHandler } from "./EventHandler/InteractionCreateHandler/index";
import { MessageCreateHandler } from "./EventHandler/MessageCreateHandler";

export function handleClient(client: Client, appData: AppData) {
  const interactionCreateHandler = new InteractionCreateHandler(appData);
  const messageCreateHandler = new MessageCreateHandler(appData);
  const guildMemberAdd = new GuildMemberAdd(appData);
  const guildUpdate = new GuildUpdate(appData);

  client.on("clientReady", async (client) => {
    client.user.setActivity({
      name: `${client.guilds.cache.size}server | ${client.users.cache.size}users | distopia.top`,
      type: ActivityType.Playing,
    });

    const commands = interactionCreateHandler.commands.map((command) => command.regist);

    await client.rest.put(`/applications/${client.user.id}/commands`, {
      body: commands,
    });
  });

  client.on(
    "interactionCreate",
    async (interaction) => await interactionCreateHandler.handle(interaction),
  );

  client.on("messageCreate", async (message) => await messageCreateHandler.handle(message));

  client.on("guildMemberAdd", async (member) => await guildMemberAdd.handle(member));

  client.on(
    "guildUpdate",
    async (oldGuild, newGuild) => await guildUpdate.handle(oldGuild, newGuild),
  );

  return client;
}
