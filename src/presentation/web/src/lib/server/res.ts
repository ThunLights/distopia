import { json } from "@sveltejs/kit";

export function errorJson(content: string) {
  return json({ content }, { status: 400 });
}
