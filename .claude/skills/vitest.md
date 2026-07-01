---
description: Vitest unit testing patterns, mocking, and test structure used across distopia packages
---

# Vitest Guide

Testing framework used across all non-web packages. Web component tests use Vitest with `vitest-browser-svelte`.

## Running Tests

```bash
# All packages (via Turborepo)
cd docker && docker compose exec app bun run test

# Single package
cd docker && docker compose exec app sh -c "cd src/infrastructure/http && bun run test"
cd docker && docker compose exec app sh -c "cd src/presentation/bot && bun run test"

# Watch mode (inside the devcontainer)
cd src/infrastructure/http && bun run vitest
```

## Basic Test Structure

```typescript
import { describe, expect, it } from "vitest";

describe("MyModule", () => {
  it("does something", () => {
    expect(1 + 1).toBe(2);
  });

  it("async operation", async () => {
    const result = await fetchSomething();
    expect(result).not.toBeNull();
  });
});
```

## Module Mocking with `vi.mock`

### Mock must be declared before imports

```typescript
import { describe, expect, it, vi } from "vitest";

// vi.mock is hoisted — declare before the import that uses the mocked module
vi.mock("./safefetch", () => ({
  safeFetch: vi.fn(),
}));

import { safeFetch } from "./safefetch";
```

### Preserving real exports while mocking specific ones

```typescript
vi.mock("./dns", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./dns")>();
  return {
    ...actual,                          // keep all real exports
    resolveHostnameToSafeIp: vi.fn(),  // override just this one
  };
});

import { resolveHostnameToSafeIp } from "./dns";
```

### Typed mock functions

```typescript
import type { MockedFunction } from "vitest";
import { resolveHostnameToSafeIp } from "./dns";

const resolveMock = resolveHostnameToSafeIp as MockedFunction<typeof resolveHostnameToSafeIp>;

// Set a default return value for all calls
resolveMock.mockResolvedValue("1.2.3.4");

// Override for the next call only
resolveMock.mockResolvedValueOnce(null);

// Override for sync functions
resolveMock.mockReturnValue(false);
resolveMock.mockReturnValueOnce(true);
```

## Setup and Teardown

```typescript
import { afterEach, beforeEach, describe, it, vi } from "vitest";

describe("MyModule", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // reset call counts and return values
  });

  afterEach(() => {
    vi.unstubAllGlobals(); // restore global stubs (fetch, etc.)
    vi.clearAllMocks();
  });
});
```

## Mocking Global `fetch`

```typescript
let fetchMock: MockedFunction<typeof fetch>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it("makes a fetch call", async () => {
  fetchMock.mockResolvedValueOnce(new Response("ok", { status: 200 }));

  await myfetch("https://example.com");

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock.mock.calls[0]?.[0]).toBe("https://example.com");
});
```

## Inspecting Call Arguments

```typescript
// Check what a mock was called with
const [url, init] = fetchMock.mock.calls[0] ?? [];
expect(url).toBe("https://1.2.3.4/path");
expect((init as RequestInit).redirect).toBe("manual");

const headers = new Headers((init as RequestInit).headers);
expect(headers.get("authorization")).toBeNull();
```

## Parametrized Tests

```typescript
it.each([
  ["https://example.com", true],
  ["ftp://example.com", false],
  ["not-a-url", false],
])("validateSafeUrl('%s') returns %s", (input, expected) => {
  expect(validateSafeUrl(input) !== null).toBe(expected);
});

// With labels
it.each([
  ["100.64.0.0", "CGNAT lower bound"],
  ["100.127.255.255", "CGNAT upper bound"],
])("isLocalIPv4(%s) — %s", (ip) => {
  expect(isLocalIPv4(ip)).toBe(true);
});
```

## Error Assertions

```typescript
// Check instanceof for discriminated error types
expect(result).toBeInstanceOf(LocalAddressError);
expect(result).not.toBeInstanceOf(Error);

// Expect a thrown error
await expect(riskyFunction()).rejects.toThrow("some message");
expect(() => syncFunction()).toThrow();
```

## Creating Fake Response Objects for Tests

When the real `fetch` is mocked at the module level (via `vi.mock("./safefetch", ...)`), create lightweight fake Response-like objects:

```typescript
function fakeResponse(
  responseUrl: string,
  status = 200,
  body = "",
  extraHeaders: Record<string, string> = {},
): Response {
  const obj = {
    url: responseUrl,
    status,
    headers: new Headers(extraHeaders),
    clone() { return fakeResponse(responseUrl, status, body, extraHeaders); },
    async text() { return body; },
    async json() { return JSON.parse(body); },
    body: null as null,
  };
  return obj as unknown as Response;
}
```

## Testing Proxied or Wrapped Objects

When testing code that uses `Proxy` to wrap native objects (e.g. `Response`), be aware that native class private fields (`#state` in Bun's `Response`) require the `target` as the `Reflect.get` receiver:

```typescript
// In safefetch.ts — correct pattern for wrapping Response in a Proxy:
return new Proxy(response, {
  get(target, prop) {
    if (prop === "url") return finalUrl;
    const value = Reflect.get(target, prop, target); // use target, not receiver
    return typeof value === "function" ? value.bind(target) : value;
  },
}) as Response;
```

## File Naming Convention

| Context | File name |
|---|---|
| Unit test | `<module>.test.ts` (e.g. `safefetch.test.ts`) |
| Web component test | `<Component>.spec.ts` (e.g. `SearchBar.spec.ts`) |
| Storybook story | `<Component>.stories.svelte` |

## vitest.config.ts

Each package configures Vitest in its own `vitest.config.ts` (or the root `package.json` `scripts.test`). The web package uses `vitest-browser-svelte` for in-browser component tests. Non-web packages use the standard Node.js environment.
