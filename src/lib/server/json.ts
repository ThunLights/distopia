import { json } from "@sveltejs/kit";

export function generateErrorJson(content: string, status?: number) {
	return json(
		{
			content
		},
		{ status: status ?? 400 }
	);
}
