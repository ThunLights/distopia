import type { AppCore } from "app-core";
import {
  ActionRowBuilder,
  EmbedBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  type APIEmbedField,
  type InteractionReplyOptions,
} from "discord.js";
import type { Guild } from "domain-model";

export type SettingsEntry = {
  label: string;
  // Select menu value on the /settings panel; must be unique.
  value: string;
  page: (core: AppCore, guild: Guild) => Promise<InteractionReplyOptions>;
  // Fields summarizing this entry's current state, shown on the /settings panel embed.
  fields?: (core: AppCore, guild: Guild) => Promise<APIEmbedField[]>;
};

// ponytail: Discord caps both select options and embed fields at 25; split the panel if exceeded.
const entries: SettingsEntry[] = [];

export function addSettings(...added: SettingsEntry[]) {
  for (const entry of added) {
    if (entries.some(({ value }) => value === entry.value)) {
      throw new Error(`Duplicate settings value: ${entry.value}`);
    }
    entries.push(entry);
  }
}

export function findSettings(value: string) {
  return entries.find((entry) => entry.value === value);
}

export async function settingsPage(core: AppCore, guild: Guild): Promise<InteractionReplyOptions> {
  const fields = await Promise.all(entries.map((entry) => entry.fields?.(core, guild) ?? []));

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle("設定パネル")
    .setDescription("設定を色々変えられます。")
    .addFields(fields.flat());

  const selector = new StringSelectMenuBuilder()
    .setCustomId("setting")
    .setPlaceholder("変更要素を選択")
    .addOptions(
      entries.map(({ label, value }) =>
        new StringSelectMenuOptionBuilder().setLabel(label).setValue(value),
      ),
    );

  return {
    embeds: [embed],
    components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selector)],
    flags: [MessageFlags.Ephemeral],
  };
}
