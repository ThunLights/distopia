import { browser } from "$app/environment";
import { token2data } from "$lib/auth.svelte";

export const load = (async () => {
    return {
        auth: browser ? await token2data() : null,
		adsense: browser ? Boolean(localStorage.getItem("adsense")) : false,
    }
});
