import type { Response } from "$routes/api/home/+server"

export async function home() {
	const response = await fetch("/api/home", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			take: 30
		})
	})
	if (response.ok) {
		const json: Response = await response.json();
		return json;
	}
	return null;
}
