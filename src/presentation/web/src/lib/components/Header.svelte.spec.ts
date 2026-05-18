import Header from "./Header.svelte";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";

describe("Header", () => {
  test("Login Button", async () => {
    render(Header, { userData: null });

    await expect.element(page.getByText("Login")).toBeVisible();
  });

  test("User Button", async () => {
    render(Header, { userData: { username: "example user", id: "11111111" } });

    await expect.element(page.getByText("example user")).toBeVisible();
  });
});
