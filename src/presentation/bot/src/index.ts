import { ActivityType, type Client } from "discord.js";

import { GuildMemberAdd } from "./EventHandler/GuildMemberAdd";
import { GuildUpdate } from "./EventHandler/GuildUpdate";
import { InteractionCreateHandler } from "./EventHandler/InteractionCreateHandler/index";
import { MessageCreateHandler } from "./EventHandler/MessageCreateHandler";
import type { AppData } from "./model";

export function handleClient(client: Client, appData: AppData) {
  const interactionCreateHandler = new InteractionCreateHandler(client, appData);

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

  client.on("interactionCreate", interactionCreateHandler.handle);

  client.on("messageCreate", new MessageCreateHandler(client, appData).handle);

  client.on("guildMemberAdd", new GuildMemberAdd(client, appData).handle);

  client.on("guildUpdate", new GuildUpdate(client, appData).handle);

  return client;
}
