import type { AppCore } from "app-core";
import { ActivityType, type Client } from "discord.js";

import { GuildMemberAddHandler } from "./EventHandler/GuildMemberAddHandler";
import { InteractionCreateHandler } from "./EventHandler/InteractionCreateHandler/index";
import { MessageCreateHandler } from "./EventHandler/MessageCreateHandler";

export function handleClient(client: Client, core: AppCore) {
  const interactionCreateHandler = new InteractionCreateHandler(core);
  const messageCreateHandler = new MessageCreateHandler(core);
  const guildMemberAddHandler = new GuildMemberAddHandler(core);

  client.on("clientReady", async (client) => {
    client.user.setActivity({
      name: `${client.guilds.cache.size}server | ${client.users.cache.size}users | distopia.top`,
      type: ActivityType.Playing,
    });

    const commands = interactionCreateHandler.commands.chatInput.map((command) => command.register);

    await client.rest.put(`/applications/${client.user.id}/commands`, {
      body: commands,
    });
  });

  client.on(
    "interactionCreate",
    async (interaction) => await interactionCreateHandler.handle(interaction),
  );

  client.on("messageCreate", async (message) => await messageCreateHandler.handle(message));

  client.on("guildMemberAdd", async (member) => await guildMemberAddHandler.handle(member));

  return client;
}
