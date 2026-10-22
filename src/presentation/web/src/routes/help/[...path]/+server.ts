import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";

export const GET: RequestHandler = ({ params }) => {
  redirect(301, `https://docs.distopia.top/${params.path}`, { external: true });
};
