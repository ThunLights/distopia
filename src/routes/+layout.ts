import { token2data } from "$lib/auth.svelte";

export const load = (async () => {
    return {
        auth: await token2data(),
    }
});
