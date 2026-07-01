---
description: Zod 4 validation patterns used across distopia — schemas, safeParse, and integration with handlers and Prisma
---

# Zod 4 Guide

Version: **4.4.3** (pinned in `workspaces.catalog`)
Import: `import { z } from "zod"` or `import z from "zod"`

Used throughout the project for:
- Discord modal / slash command option validation (`presentation-bot`)
- API request body validation (`presentation-web` server handlers)
- URL validation (`infra-http`)
- Auto-generated Prisma model schemas (`infra-database`)

## Core Primitives

```typescript
import { z } from "zod";

z.string()
z.number()
z.boolean()
z.bigint()
z.date()
z.literal("value")
z.enum(["a", "b", "c"])
z.null()
z.undefined()
z.unknown()
```

## Object Schema

```typescript
const Schema = z.object({
  name: z.string(),
  age: z.number().int().min(0).max(150),
  email: z.string().email().optional(),
  role: z.enum(["admin", "member"]).default("member"),
});

type Schema = z.infer<typeof Schema>;
```

## String Validators

```typescript
z.string().min(1).max(100)
z.string().email()
z.string().url()
z.string().regex(/^\d{4}$/)
z.string().startsWith("discord:")
z.string().trim()
z.string().nonempty()       // equivalent to .min(1)
```

## Parse vs safeParse

```typescript
// parse — throws ZodError on failure
const value = Schema.parse(rawInput);

// safeParse — returns { success, data } | { success: false, error }
const result = Schema.safeParse(rawInput);
if (!result.success) {
  console.error(result.error.issues);
  return null;
}
const value = result.data;
```

Always use `safeParse` at trust boundaries (user input, external APIs). Use `parse` only for trusted, already-validated data.

## refine — Custom Validation

```typescript
const SafeUrlSchema = z
  .string()
  .refine(
    (url) => {
      const parsed = URL.parse(url);
      return parsed !== null && (parsed.protocol === "http:" || parsed.protocol === "https:");
    },
    { message: "URL must be a valid http or https URL" },
  )
  .transform((url) => url as SafeUrl);
```

## transform — Shape Conversion

```typescript
const IdSchema = z.string().transform((s) => parseInt(s, 10));
// Output type: number, even though input is string

const result = IdSchema.safeParse("42");
result.data; // 42 (number)
```

## Array and Union

```typescript
z.array(z.string())
z.array(z.string()).min(1).max(10)

z.union([z.string(), z.number()])
// shorthand:
z.string().or(z.number())
```

## Optional and Nullable

```typescript
z.string().optional()    // string | undefined
z.string().nullable()    // string | null
z.string().nullish()     // string | null | undefined
```

## Discord Bot — Modal / Command Validation

The bot uses a `validator` utility that wraps `safeParse` and formats errors for Discord replies:

```typescript
import z from "zod";
import { validator, type ValidateResult } from "../../../utils/validator";

const OptionsSchema = z.object({
  message: z.string().min(1).max(2000),
  channelId: z.string().regex(/^\d+$/),
});

type Options = z.infer<typeof OptionsSchema>;

// In parseOptions():
return await validator(
  {
    message: interaction.fields.getTextInputValue("message"),
    channelId: interaction.fields.getTextInputValue("channelId"),
  },
  OptionsSchema,
);
```

`ValidateResult<T>` is `T | ValidationError`. The base class returns a formatted error reply to Discord if it receives `ValidationError`.

## Web — API Endpoint Validation

The `validateHandler` / `authAndValidateHandler` wrappers in `$lib/server/handler` accept a Zod schema and validate the parsed request body. They return HTTP 400 automatically on failure.

```typescript
import z from "zod";
import { authAndValidateHandler } from "$lib/server/handler";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const BodySchema = z.object({
  guildId: z.string(),
  content: z.string().max(1000),
});

export const POST: RequestHandler = await authAndValidateHandler(BodySchema, async (e, body) => {
  // body is typed as z.infer<typeof BodySchema>
  return json({ ok: true });
});
```

The handler validates with `BodySchema.safeParse(await e.request.json())`.

## infra-http — URL Validation

`validateSafeUrl` uses a Zod schema internally:

```typescript
// src/infrastructure/http/src/safeurl.ts
const safeUrlSchema = z
  .string()
  .refine(
    (url) => {
      const parsed = URL.parse(url);
      return parsed !== null && (parsed.protocol === "http:" || parsed.protocol === "https:");
    },
    { message: "URL must be a valid http or https URL" },
  )
  .transform((url) => url as SafeUrl);

export function validateSafeUrl(url: string): SafeUrl | null {
  const result = safeUrlSchema.safeParse(url);
  return result.success ? result.data : null;
}
```

## Prisma — Auto-generated Schemas

`zod-prisma-types` generates Zod schemas for every Prisma model during `bun run build`. They live in `src/infrastructure/database/src/zod/`. Never edit them directly — they are regenerated on build.

Import the generated types via `infra-database/types`:

```typescript
import type { GuildCreateInput, UserUpdateInput } from "infra-database/types";
```

## Type Inference

```typescript
const Schema = z.object({ name: z.string(), age: z.number() });
type Schema = z.infer<typeof Schema>;
// { name: string; age: number }

// Input type (before transforms/defaults)
type SchemaInput = z.input<typeof Schema>;
```

## Zod 4 vs Zod 3 Notes

Zod 4 (this project uses 4.4.3) is largely API-compatible with Zod 3 but has some differences:

- Import: `from "zod"` works directly — no need for `from "zod/v4"`
- `z.string().email()` and other string validators are unchanged
- `z.ZodError` and `.issues` shape are mostly unchanged
- Performance is significantly improved in v4
