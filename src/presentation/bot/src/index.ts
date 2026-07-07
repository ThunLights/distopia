import type { AppCore } from "app-core";
import type { Client } from "discord.js";

import { GuildMemberAddHandler } from "./EventHandler/GuildMemberAddHandler";
import { InteractionCreateHandler } from "./EventHandler/InteractionCreateHandler/index";
import { MessageCreateHandler } from "./EventHandler/MessageCreateHandler";
import { MessageUpdateHandler } from "./EventHandler/MessageUpdateHandler";

export function handleClient(client: Client, core: AppCore) {
  const interactionCreateHandler = new InteractionCreateHandler(core);
  const messageCreateHandler = new MessageCreateHandler(core);
  const messageUpdateHandler = new MessageUpdateHandler(core);
  const guildMemberAddHandler = new GuildMemberAddHandler(core);

  client.on("clientReady", async (client) => {
    await core.user.setActivity();

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

  client.on(
    "messageUpdate",
    async (oldMsg, newMsg) => await messageUpdateHandler.handle(oldMsg, newMsg),
  );

  client.on("guildMemberAdd", async (member) => await guildMemberAddHandler.handle(member));

  return client;
}
