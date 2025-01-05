import { ModalsBase, ModalsError } from "./Modal.base";
import { database } from "$lib/server/Database/index";

import type { ModalSubmitInteraction, CacheType, InteractionReplyOptions, MessagePayload } from "discord.js";

export class FriendModal extends ModalsBase {
    public readonly customId = "friend";

	public async commands(interaction: ModalSubmitInteraction<CacheType>): Promise<(InteractionReplyOptions & { fetchReply: true; }) | string | MessagePayload | ModalsError | null> {
		const nsfw = interaction.fields.getTextInputValue("nsfw") === "ok";
		const tags = interaction.fields.getTextInputValue("tags").split("\n");
		const profile = interaction.fields.getTextInputValue("profile");
		await database.friend.update({
			userId: interaction.user.id,
			username: interaction.user.username,
			description: profile,
			time: new Date(),
			nsfw,
		});
		for (const tag of tags) {
			await database.friend.tag.update(interaction.user.id, tag);
		}
		return { content: "投稿しました!", ephemeral: true };
	}
}
