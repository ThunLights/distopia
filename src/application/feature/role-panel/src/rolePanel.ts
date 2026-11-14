import {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  StringSelectMenuBuilder,
  type GuildTextBasedChannel,
  type Message,
} from "discord.js";

export const ROLE_PANEL_CUSTOM_ID = "rolePanel";
export const ROLE_PANEL_MAX_ROLES = 25;

const letter = (index: number) => String.fromCodePoint(0x1f1e6 + index);

// The panel message itself is the only storage: role IDs live in the select menu options.
export function buildRolePanel(embed: EmbedBuilder, roles: { id: string; name: string }[]) {
  return {
    embeds: [
      embed.setFields({
        name: "役職",
        value: roles.map((role, i) => `${letter(i)}:<@&${role.id}>`).join("\n"),
      }),
    ],
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(ROLE_PANEL_CUSTOM_ID)
          .setPlaceholder("役職を選択 (付与済みの役職は外れます)")
          .setMinValues(0)
          .setMaxValues(roles.length)
          .addOptions(
            roles.map((role, i) => ({
              label: role.name.slice(0, 100),
              value: role.id,
              emoji: letter(i),
            })),
          ),
      ),
    ],
    allowedMentions: { parse: [] },
  };
}

export function rolePanelRoleIds(message: Pick<Message, "components">): string[] | null {
  for (const row of message.components) {
    if (row.type !== ComponentType.ActionRow) {
      continue;
    }
    for (const component of row.components) {
      if (
        component.type === ComponentType.StringSelect &&
        component.customId === ROLE_PANEL_CUSTOM_ID
      ) {
        return component.options.map((option) => option.value);
      }
    }
  }
  return null;
}

// ponytail: only scans the latest 100 messages, so an older panel is neither editable nor blocks
// a second create; store panels in the DB if that matters.
export async function findLatestRolePanel(channel: GuildTextBasedChannel, botId: string) {
  const messages = await channel.messages.fetch({ limit: 100 });
  return messages.find((m) => m.author.id === botId && rolePanelRoleIds(m) !== null) ?? null;
}
