import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags, PermissionsBitField, UserSelectMenuBuilder } from "discord.js";
import { ButtonsBase, ButtonsError } from "./Buttons.base";
import { errorHandling } from "$lib/server/error";

import type { ButtonInteraction, CacheType, MessagePayload, InteractionReplyOptions } from "discord.js";

export class ActingOwnerButton extends ButtonsBase {
	public readonly customId = "actingOwner";

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
				.setColor("Blurple")
				.setTitle("オーナー代理設定")
				.setDescription("特定のユーザーに対してオーナー代理を設定すると解除するまでDistopiaサービスでオーナーと同等の権限を持ちます。");
			const userSelector = new UserSelectMenuBuilder()
				.setCustomId("actingOwner")
				.setMaxValues(1);
			const comeBackButton = new ButtonBuilder()
				.setCustomId("actingOwnerCancel")
				.setLabel("自分に権限を戻す。")
				.setStyle(ButtonStyle.Danger);

			return {
				embeds: [ embed ],
				components: [
					new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(userSelector),
					new ActionRowBuilder<ButtonBuilder>().addComponents(comeBackButton),
				],
				flags: [ MessageFlags.Ephemeral ],
			};
		} catch (error) {
			errorHandling(error);
			return { content: "ERROR", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
		}
	}
}
