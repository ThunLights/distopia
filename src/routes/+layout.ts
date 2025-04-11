import { browser } from "$app/environment";
import { token2data } from "$lib/client/auth";

export const load = async (e) => {
	return {
		...e.data,
		...{
			auth: browser ? await token2data() : null
		}
	};
};
