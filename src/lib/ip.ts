import type { RequestEvent } from "@sveltejs/kit";

export function parseIp(e: RequestEvent): string {
	const { headers } = e.request;
	return headers.get("cf-connecting-ip") || headers.get("cf-pseudo-ipv4") || e.getClientAddress();
}

export const torCheck = (e: RequestEvent): boolean =>
	e.request.headers.get("cf-ipcountry") === "T1";
