import { ActivityType, type Client } from "infra-discord/prelude";

import { GuildMemberAdd } from "./EventHandler/GuildMemberAdd";
import { GuildUpdate } from "./EventHandler/GuildUpdate";
import { InteractionCreateHandler } from "./EventHandler/InteractionCreateHandler/index";
import { MessageCreateHandler } from "./EventHandler/MessageCreateHandler";
import type { Appdata } from "./model";

export function handleClient(client: Client, appData: Appdata) {
  const interactionCreateHandler = new InteractionCreateHandler(client, appData);

  client.on("clientReady", async (client) => {
    client.user.setActivity({
      name: `${client.guilds.cache.size}server | ${client.users.cache.size}users | distopia.top`,
      type: ActivityType.Playing,
    });
  });

  client.on("interactionCreate", interactionCreateHandler.handle);

  client.on("messageCreate", new MessageCreateHandler(client, appData).handle);

  client.on("guildMemberAdd", new GuildMemberAdd(client, appData).handle);

  client.on("guildUpdate", new GuildUpdate(client, appData).handle);

  return client;
}
