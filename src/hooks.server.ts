import { errorHandling } from "$lib/error.js";

import type { HandleServerError } from "@sveltejs/kit"

export const handleError = (async (input) => {
    if (input.status === 404) {
        return;
    };
	if (input.status === 405) {
		return;
	};
	errorHandling(input);
}) satisfies HandleServerError;
