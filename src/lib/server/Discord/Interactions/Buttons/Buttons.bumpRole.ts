import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags, PermissionsBitField, RoleSelectMenuBuilder } from "discord.js";
import { ButtonsBase, ButtonsError } from "./Buttons.base";
import { errorHandling } from "$lib/server/error";

import type { ButtonInteraction, CacheType, MessagePayload, InteractionReplyOptions } from "discord.js";

export class BumpRoleButton extends ButtonsBase {
	public readonly customId = "bumpRole";

	public async commands(interaction: ButtonInteraction<CacheType>): Promise<void | string | MessagePayload | InteractionReplyOptions | ButtonsError | null> {
		try {
			if (!(
				interaction.member
				&& interaction.member.permissions
				&& interaction.member.permissions instanceof PermissionsBitField
				&& interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
			)) {
				return { content: "権限がありません", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
			}

			const embed = new EmbedBuilder()
				.setColor("Navy")
				.setTitle("Bump通知: ロール")
				.setDescription("再Bump可能時にロールをメンションします。");
			const roleSelector = new RoleSelectMenuBuilder()
				.setCustomId("bumpRole")
				.setMaxValues(1);
			const cancelButton = new ButtonBuilder()
				.setCustomId("bumpRoleCancel")
				.setLabel("ロール通知を削除する。")
				.setStyle(ButtonStyle.Danger);

			return void await interaction.reply({
				embeds: [ embed ],
				components: [
					new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleSelector),
					new ActionRowBuilder<ButtonBuilder>().addComponents(cancelButton),
				],
				flags: [ MessageFlags.Ephemeral ],
			})
		} catch (error) {
			errorHandling(error);
			return { content: "ERROR", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
		}
	}
}
