import type { HandleServerError } from "@sveltejs/kit"

export const handleError = (async (input) => {
    if (input.status === 404) {
        return;
    };
	if (input.status === 405) {
		return;
	};
	console.log(input);
}) satisfies HandleServerError;
