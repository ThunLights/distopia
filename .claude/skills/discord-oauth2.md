---
description: Architecture and implementation details of Discord OAuth2 + JWT session system
---

# Discord OAuth2 + JWT Session System

## Full Authentication Flow

```
User clicks Login
  → GET /login
      → generates PKCE pair (sessionId UUID, sessionKey UUID)
      → stores { sessionKey, createdAt } in memory keyed by sessionId
      → sets session_key cookie (20 min TTL)
      → redirects to Discord OAuth2 URL with state=sessionId

Discord redirects to /auth?code=<code>&state=<sessionId>
  → load() in routes/auth/+page.server.ts
      → reads code, state (sessionId), session_key cookie
      → fetches PKCE record from memory by sessionId
      → validates sessionKey matches cookie value
      → deletes PKCE record + clears cookie
      → calls core.oauth2.codeToUser(code)
          → OAuth2Controller.parseCode(code) → accessToken + refreshToken
          → OAuth2Controller.fetchUserInfo(accessToken) → user data
          → upserts userDiscord row (userId, accessToken, refreshToken, email)
          → caches user info in memory.userOAuth2
      → jwt.sign({ userId }) → JWT string
      → setToken(cookies, token) → sets authorization cookie (2-month TTL)
```

## Key Files

| File | Responsibility |
|---|---|
| `src/presentation/web/src/routes/login/+server.ts` | Initiates login: generates PKCE, sets cookie, redirects |
| `src/presentation/web/src/routes/auth/+page.server.ts` | Handles callback: validates PKCE, exchanges code, issues JWT |
| `src/presentation/web/src/lib/server/auth.ts` | `verifyToken`, `setToken`, `deleteToken` cookie helpers |
| `src/presentation/web/src/lib/server/JWTClient.ts` | JWT sign / verify with per-user verify key |
| `src/presentation/web/src/hooks.server.ts` | Populates `event.locals.user` on every request |
| `src/presentation/web/src/lib/server/handler.ts` | `authHandler`, `validateHandler`, `authAndValidateHandler` route wrappers |
| `src/application/core/src/OAuth2.ts` | PKCE state management, token-to-user, guild fetching, token refresh |
| `src/application/core/src/JWT.ts` | JWT key lifecycle (rotate every 30 days, expire after 1 year) |
| `src/infrastructure/discord/src/Controller/OAuth2Controller.ts` | Raw Discord API calls (code exchange, user info, guild list, join guild) |
| `src/presentation/web/src/lib/shared/constant.ts` | `PUBLIC_OAUTH_URL` definition (scopes: `identify guilds email guilds.join`) |

## Session Cookie

| Cookie | Value | TTL |
|---|---|---|
| `authorization` | JWT string | 2 months |
| `session_key` | PKCE verifier (temp) | 20 minutes (login flow only) |

The JWT is **auto-renewed** in `hooks.server.ts`: if `verifyToken` returns a `newToken` (issued when the token is within 14 days of expiry), the cookie is silently updated.

## JWT Internals (`JWTClient`)

- Signed with `serverKey + userVerifyKey` concatenated — invalidating a user's `jwtVerifyKey` (via `core.jwt.updateNewUserVerifyKey`) immediately revokes **all** that user's sessions
- `kid` header stores the JWT key ID, used to look up the correct server key on verify
- JWT keys rotate: new key generated when the current one is >30 days old; old keys deleted after 1 year

## Logout

| Endpoint | Effect |
|---|---|
| `DELETE /api/user/logout` | Deletes the `authorization` cookie (single session) |
| `DELETE /api/user/logout/all` | Rotates the user's `jwtVerifyKey`, invalidating all sessions across all devices |

Both endpoints require authentication and use `authHandler`.

## OAuth2 Token Refresh

`core.oauth2.updateTokens()` runs on a **20-minute schedule** (in `hooks.server.ts`).
It refreshes any `accessToken` / `refreshToken` pair that is older than 6 days. Tokens that fail to refresh are deleted from the DB, forcing re-login.

## Protecting a Route or API Endpoint

### Page (`+page.server.ts` / `+layout.server.ts`)

`event.locals.user` is `UserAuth | null`, populated by `hooks.server.ts` for every request.

```typescript
import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async (e) => {
  if (!e.locals.user) throw redirect(302, "/login");
  return { user: e.locals.user };
};
```

### API endpoint (`+server.ts`) — auth only

```typescript
import { authHandler } from "$lib/server/handler";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = await authHandler(async (e) => {
  const { user } = e.locals; // type is UserAuth (non-null, guaranteed by authHandler)
  return new Response(JSON.stringify({ id: user.id }), { status: 200 });
});
```

### API endpoint — auth + body validation (Zod via Standard Schema)

```typescript
import { authAndValidateHandler } from "$lib/server/handler";
import { json } from "@sveltejs/kit";
import z from "zod";
import type { RequestHandler } from "./$types";

const BodySchema = z.object({ name: z.string() });

export const POST: RequestHandler = await authAndValidateHandler(BodySchema, async (e, body) => {
  const { user } = e.locals;
  return json({ userId: user.id, name: body.name });
});
```

### API endpoint — validation only (no auth required)

```typescript
import { validateHandler } from "$lib/server/handler";
```

## Fetching the Authenticated User's Guilds

```typescript
// All guilds the user belongs to
const guilds = await core.oauth2.getGuilds(userId);

// Only guilds where the user is owner or admin
const adminGuilds = await core.oauth2.getGuildsHasOwnerOrAdmin(userId);
```

Guild data is cached in `memory.oauth2Guilds`. Pass `useCache: false` to force a fresh fetch from Discord.

## Adding a User to a Guild Programmatically

```typescript
const result = await core.oauth2.joinGuild(userId, guildId);
// result: "join" (newly added) | "joined" (already a member) | null (token missing or error)
```

Requires the `guilds.join` scope, which is already included in `PUBLIC_OAUTH_URL`.

## Security Notes

- PKCE state prevents CSRF: the `state` (sessionId) and the `session_key` cookie must both be present and match the in-memory record
- All Discord API calls use `safeFetchForDiscord` (from `infra-http`), restricting requests to `discord.com` / `discordapp.com` / `discord.gg` — SSRF is not possible
- The JWT signing key is a concatenation of a rotating server key and a per-user key, so neither alone is sufficient to forge a token
