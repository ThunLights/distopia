import { json, type RequestHandler } from "@sveltejs/kit";

export type Response = {}

export const POST = (async (e) => {
    e.request.body
    const response = {} satisfies Response;
    return json(response)
}) satisfies RequestHandler;
