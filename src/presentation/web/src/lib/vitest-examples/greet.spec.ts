import { greet } from "./greet";
import { describe, it, expect } from "vitest";

describe("greet", () => {
  it("returns a greeting", () => {
    expect(greet("Svelte")).toBe("Hello, Svelte!");
  });
});
