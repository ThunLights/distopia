import { describe, expect, test } from "vitest";

import { useAsync } from "./async";

describe("useAsync", async () => {
  test('() => "hoge"', async () => {
    const func = useAsync(() => "hoge");
    expect(await func()).toBe("hoge");
  });
  test("(a: number, b: number) => a + b", async () => {
    const func = useAsync((a: number, b: number) => a + b);
    expect(await func(1, 3)).toBe(4);
  });
  test("rejects when the wrapped function throws", async () => {
    const func = useAsync(() => {
      throw new Error("boom");
    });
    await expect(func()).rejects.toThrow("boom");
  });
});
