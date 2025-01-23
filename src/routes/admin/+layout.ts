import { browser } from "$app/environment";
import { redirect } from "@sveltejs/kit";

import type { LayoutLoad } from "./$types";

export const load = (async (e) => {
	const { auth } = await e.parent();

	if (!browser || !auth) {
		return {
			canUse: false
		}
	}

	const response = await fetch("/api/admin", {
		method: "POST",
		headers: {
			Authorization: auth.token,
		}
	});

	if (response.status === 200) {
		return {
			canUse: true,
		}
	}
	return redirect(301, "/");
}) satisfies LayoutLoad;
