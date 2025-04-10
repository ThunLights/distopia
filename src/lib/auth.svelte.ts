import type { Response } from "$routes/api/auth/+server";

export async function token2data() {
	try {
		const token = localStorage.getItem("token");
		if (token) {
			const response = await fetch("/api/auth", {
				method: "POST",
				headers: {
					Authorization: token
				}
			});
			if (response.ok) {
				const json: Response = await response.json();
				if (json && json.content) {
					if (typeof json.content === "string") {
						console.log(`Error: ${json.content}`);
					} else {
						return json.content;
					}
				}
			}
		}
		return null;
	} catch {
		return null;
	}
}
