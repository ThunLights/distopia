import { ModalsBase, ModalsError } from "./Modal.base";
import { database } from "$lib/server/Database/index";
import { _TagsZod } from "$lib/server/Database/Friend/Friend.tag";
import { structChecker } from "$lib/struct";
import { z } from "zod";
import { MessageFlags } from "discord.js";
import { compressTxt } from "$lib/compress";
import { CHARACTER_LIMIT } from "$lib/constants";
import { dedepulication } from "$lib/array";

import type {
	ModalSubmitInteraction,
	CacheType,
	InteractionReplyOptions,
	MessagePayload
} from "discord.js";

export class FriendModal extends ModalsBase {
	public readonly customId = "friend";

	private async tagsChecker(tags: string[]) {
		const data = {
			tags
		};
		const checkerZod = z.object({
			tags: _TagsZod
		});
		return (structChecker(data, checkerZod) ?? { tags: [] }).tags;
	}

	public async commands(
		interaction: ModalSubmitInteraction<CacheType>
	): Promise<
		(InteractionReplyOptions & { fetchReply: true }) | string | MessagePayload | ModalsError | null
	> {
		const tags = dedepulication(
			await this.tagsChecker(interaction.fields.getTextInputValue("tags").split("\n"))
		);
		const nsfw = interaction.fields.getTextInputValue("nsfw") === "ok";
		const profile = compressTxt(
			interaction.fields.getTextInputValue("profile"),
			CHARACTER_LIMIT.description
		);

		await database.friend.tag.delete(interaction.user.id);
		await database.friend.update({
			userId: interaction.user.id,
			username: interaction.user.username,
			description: profile,
			time: new Date(),
			nsfw
		});
		for (const tag of tags) {
			await database.friend.tag.update(interaction.user.id, tag);
		}
		return { content: "投稿しました!", flags: [MessageFlags.Ephemeral] };
	}
}
