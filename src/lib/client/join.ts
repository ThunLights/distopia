import { Toast } from "./toast";

import type { Response } from "$routes/api/auth/join/+server";

export async function guildJoin(token: string, guildId: string, guildName: string) {
	try {
		const response = await fetch("/api/auth/join", {
			method: "POST",
			headers: {
				Authorization: token,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				guildId
			})
		});
		if (response.ok) {
			const json: Response = await response.json();
			const content =
				json.content === "entry"
					? `「${guildName}」に参加しました。Discordを確認してください`
					: json.content === "joined"
						? `「${guildName}」には既に参加しています。`
						: `エラー: 「${guildName}」参加できませんでした。数分待ってから再度試し見てください。`;
			if (json.content === "error") {
				Toast.error(content);
			} else {
				Toast.success(content);
			}
		}
		return null;
	} catch {
		return null;
	}
}
