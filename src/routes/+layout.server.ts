import { UAParser } from "ua-parser-js";

export const ssr = true;

export const load = (async (e) => {
	const ua = e.request.headers.get("User-Agent");
	if (!ua) {
		return {
			isMobile: true,
		}
	}

	const { device } = UAParser(ua);
    return {
		isMobile: device.type === "mobile",
	};
});
