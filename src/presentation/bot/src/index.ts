import { ActivityType, type Client } from "infra-discord/prelude";

import { GuildMemberAdd } from "./EventHandler/GuildMemberAdd";
import { GuildUpdate } from "./EventHandler/GuildUpdate";
import { InteractionCreateHandler } from "./EventHandler/InteractionCreateHandler";
import { MessageCreateHandler } from "./EventHandler/MessageCreateHandler";

export function handleClient(client: Client) {
  client.on("clientReady", async (client) => {
    client.user.setActivity({
      name: `${client.guilds.cache.size}server | ${client.users.cache.size}users | distopia.top`,
      type: ActivityType.Playing,
    });
  });

  client.on("interactionCreate", new InteractionCreateHandler(client).handle);

  client.on("messageCreate", new MessageCreateHandler(client).handle);

  client.on("guildMemberAdd", new GuildMemberAdd(client).handle);

  client.on("guildUpdate", new GuildUpdate(client).handle);

  return client;
}
