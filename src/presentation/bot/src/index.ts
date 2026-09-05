import type { AppCore } from "app-core";
import type { Client, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";

import { ChannelCreateHandler } from "./EventHandler/ChannelCreateHandler";
import { ChannelDeleteHandler } from "./EventHandler/ChannelDeleteHandler";
import { ChannelUpdateHandler } from "./EventHandler/ChannelUpdateHandler";
import { GuildBanAddHandler } from "./EventHandler/GuildBanAddHandler";
import { GuildBanRemoveHandler } from "./EventHandler/GuildBanRemoveHandler";
import { GuildMemberAddHandler } from "./EventHandler/GuildMemberAddHandler";
import { GuildMemberRemoveHandler } from "./EventHandler/GuildMemberRemoveHandler";
import { GuildMemberUpdateHandler } from "./EventHandler/GuildMemberUpdateHandler";
import { InteractionCreateHandler } from "./EventHandler/InteractionCreateHandler/index";
import { MessageCreateHandler } from "./EventHandler/MessageCreateHandler";
import { MessageDeleteHandler } from "./EventHandler/MessageDeleteHandler";
import { MessageUpdateHandler } from "./EventHandler/MessageUpdateHandler";
import { RoleCreateHandler } from "./EventHandler/RoleCreateHandler";
import { RoleDeleteHandler } from "./EventHandler/RoleDeleteHandler";
import { RoleUpdateHandler } from "./EventHandler/RoleUpdateHandler";
import { VoiceStateUpdateHandler } from "./EventHandler/VoiceStateUpdateHandler";

export function handleClient(client: Client, core: AppCore) {
  const interactionCreateHandler = new InteractionCreateHandler(core);
  const messageCreateHandler = new MessageCreateHandler(core);
  const messageUpdateHandler = new MessageUpdateHandler(core);
  const messageDeleteHandler = new MessageDeleteHandler(core);
  const guildMemberAddHandler = new GuildMemberAddHandler(core);
  const guildMemberRemoveHandler = new GuildMemberRemoveHandler(core);
  const guildMemberUpdateHandler = new GuildMemberUpdateHandler(core);
  const guildBanAddHandler = new GuildBanAddHandler(core);
  const guildBanRemoveHandler = new GuildBanRemoveHandler(core);
  const roleCreateHandler = new RoleCreateHandler(core);
  const roleUpdateHandler = new RoleUpdateHandler(core);
  const roleDeleteHandler = new RoleDeleteHandler(core);
  const channelCreateHandler = new ChannelCreateHandler(core);
  const channelUpdateHandler = new ChannelUpdateHandler(core);
  const channelDeleteHandler = new ChannelDeleteHandler(core);
  const voiceStateUpdateHandler = new VoiceStateUpdateHandler(core);

  client.on("clientReady", async (client) => {
    await core.user.setActivity();

    const commands = interactionCreateHandler.commands.chatInput
      .filter((command) => command.availableGuildId === null)
      .map((command) => command.register);
    const specificGuildCommands = new Map<
      string,
      RESTPostAPIChatInputApplicationCommandsJSONBody[]
    >();

    for (const command of interactionCreateHandler.commands.chatInput) {
      if (command.availableGuildId === null) {
        continue;
      }

      const guildIds =
        typeof command.availableGuildId === "string"
          ? [command.availableGuildId]
          : command.availableGuildId;

      for (const guildId of guildIds) {
        const guildCommands = specificGuildCommands.get(guildId) ?? [];
        guildCommands.push(command.register);
        specificGuildCommands.set(guildId, guildCommands);
      }
    }

    try {
      await client.rest.put(`/applications/${client.user.id}/commands`, {
        body: commands,
      });
    } catch (error) {
      console.error("[commands] failed to register global commands", error);
    }

    for (const [guildId, guildCommands] of specificGuildCommands) {
      try {
        await client.rest.put(`/applications/${client.user.id}/guilds/${guildId}/commands`, {
          body: guildCommands,
        });
      } catch (error) {
        // One guild's registration failing (e.g. the bot was removed from a supporter
        // server, or was never invited with the applications.commands scope there --
        // Discord returns 403 "Missing Access") must not abort registration for every
        // other guild in this loop, including the home server.
        console.error(`[commands] failed to register commands for guild ${guildId}`, error);
      }
    }
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

  client.on("messageDelete", async (message) => await messageDeleteHandler.handle(message));

  client.on("guildMemberAdd", async (member) => await guildMemberAddHandler.handle(member));

  client.on("guildMemberRemove", async (member) => await guildMemberRemoveHandler.handle(member));

  client.on(
    "guildMemberUpdate",
    async (oldMember, newMember) => await guildMemberUpdateHandler.handle(oldMember, newMember),
  );

  client.on("guildBanAdd", async (ban) => await guildBanAddHandler.handle(ban));

  client.on("guildBanRemove", async (ban) => await guildBanRemoveHandler.handle(ban));

  client.on("roleCreate", async (role) => await roleCreateHandler.handle(role));

  client.on(
    "roleUpdate",
    async (oldRole, newRole) => await roleUpdateHandler.handle(oldRole, newRole),
  );

  client.on("roleDelete", async (role) => await roleDeleteHandler.handle(role));

  client.on("channelCreate", async (channel) => await channelCreateHandler.handle(channel));

  client.on(
    "channelUpdate",
    async (oldChannel, newChannel) => await channelUpdateHandler.handle(oldChannel, newChannel),
  );

  client.on("channelDelete", async (channel) => await channelDeleteHandler.handle(channel));

  client.on(
    "voiceStateUpdate",
    async (oldState, newState) => await voiceStateUpdateHandler.handle(oldState, newState),
  );

  return client;
}
