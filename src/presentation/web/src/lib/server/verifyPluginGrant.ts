import { redis } from "./redis";
import { randomBytes } from "node:crypto";

const GRANT_TTL_SECONDS = 600;

const key = (name: string) => `web:verify-plugin:${name}`;

// The disguised plugin routes carry no guild context, so the verify page's load (which has
// already checked the guild's verification is enabled and the user is a member) mints a random
// name bound to that user; the routes only serve a name granted to the requesting user.
export async function issuePluginGrant(userId: string): Promise<string> {
  const name = randomBytes(6).toString("base64url");
  await redis.set(key(name), userId, "EX", GRANT_TTL_SECONDS);
  return name;
}

export async function hasPluginGrant(name: string, userId: string): Promise<boolean> {
  return (await redis.get(key(name))) === userId;
}
