import { toast } from "@zerodevx/svelte-toast";

import type { Response } from "$routes/api/auth/join/+server";

export async function guildJoin(token: string, guildId: string, guildName: string) {
	try {
		const response = await fetch("/api/auth/join", {
			method: "POST",
			headers: {
				Authorization: token,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				guildId,
			}),
		});
		if (response.ok) {
			const json: Response = await response.json();
			const content = json.content === "entry"
				? `「${guildName}」に参加しました。Discordを確認してください`
				: json.content === "joined"
					? `「${guildName}」には既に参加しています。`
					: `エラー: 「${guildName}」参加できませんでした。数分待ってから再度試し見てください。`;
			toast.push(content, {
				theme: {
				  "--toastColor": "mintcream",
				  "--toastBackground": json.content === "error" ? "rgb(168, 13, 13)" : "rgba(72,187,120,0.9)",
				  "--toastBarBackground": "#2F855A"
				}
			})
		}
		return null;
	} catch (error) {
		return null;
	}
}
