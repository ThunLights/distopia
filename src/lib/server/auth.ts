import { errorHandling, ServerError } from "$lib/server/error";
import { database } from "$lib/server/Database/index";

import type { RequestEvent } from "@sveltejs/kit";

export async function authorization(e: RequestEvent) {
	try {
		const { headers } = e.request;
		const token = headers.get("Authorization");
		if (!token) {
			return new ServerError("TOKEN_NOT_FOUND");
		}
		const data = await token2data(token);
		if (data instanceof ServerError) {
			return data;
		}
		return {
			content: {
				token,
				id: data.id,
				username: data.username,
				email: await database.email.data(data.id),
				avatar: await database.avatar.data(data.id)
			},
			data
		};
	} catch (error) {
		errorHandling(error);
		return new ServerError("SERVERSIDE_ERROR");
	}
}

export async function token2data(token: string) {
	try {
		const id = await database.token.tokenCheck(token);
		if (!id) {
			return new ServerError("INVALID_TOKEN");
		}
		const data = await database.user.data(id);
		if (!data) {
			return new ServerError("USERDATA_NOT_FOUND");
		}
		return data;
	} catch (error) {
		errorHandling(error);
		return new ServerError("SERVERSIDE_ERROR");
	}
}
