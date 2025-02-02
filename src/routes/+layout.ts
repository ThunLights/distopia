import { browser } from "$app/environment";
import { token2data } from "$lib/auth.svelte";

export const load = (async (e) => {
    return {
		...e.data,
		...{
			auth: browser ? await token2data() : null,
		}
    }
});
