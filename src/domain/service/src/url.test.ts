import { describe, expect, test } from "vitest";

import { findUrlsSync } from "./url";

describe("url.ts", () => {
  test("findUrls", () => {
    const urls = findUrlsSync(
      [
        // dummy
        "hogefuga",
        "https://discord.com/",
        "https://discord.com/terms",
        "https://discord.com/terms/terms-of-service-april-2024",

        // invite links
        "discord.gg/hoge",
        "discord.com/invite/hoge",
        "discordapp.com/invite/hoge",
        "http://discord.gg/hoge",
        "http://discord.com/invite/hoge",
        "https://discord.gg/hoge",
        "https://discord.com/invite/hoge",
        "http://\\ｃaｎaｒｙ.𝑑𝓲Ｓ𝐜𝑜ｒᵈＡpＰ.𝐜𝑜ｍ\\google.com⁂⌘∮/..\\/invite\\/youtube.com‖∠∇\\../twitter.com⁑∋〻\\../\\../hoge",
        "https://\\ｃaｎaｒｙ.𝑑𝓲Ｓ𝐜𝑜ｒᵈＡpＰ.𝐜𝑜ｍ\\google.com⁂⌘∮/..\\/invite\\/youtube.com‖∠∇\\../twitter.com⁑∋〻\\../\\../hoge",
        "hogefuga https://discord.com/ https://discord.com/terms https://discord.com/terms/terms-of-service-april-2024 discord.gg/fuga discord.com/invite/fuga discordapp.com/invite/fuga http://discord.gg/fuga http://discord.com/invite/fuga https://discord.gg/fuga https://discord.com/invite/fuga http://\\ｃaｎaｒｙ.𝑑𝓲Ｓ𝐜𝑜ｒᵈＡpＰ.𝐜𝑜ｍ\\google.com⁂⌘∮/..\\/invite\\/youtube.com‖∠∇\\../twitter.com⁑∋〻\\../\\../fuga https://\\ｃaｎaｒｙ.𝑑𝓲Ｓ𝐜𝑜ｒᵈＡpＰ.𝐜𝑜ｍ\\google.com⁂⌘∮/..\\/invite\\/youtube.com‖∠∇\\../twitter.com⁑∋〻\\../\\../fuga",
      ].join("\n"),
    );

    expect(urls.inviteLinks).toEqual([
      "discord.gg/hoge",

      "discord.com/invite/hoge",

      "discordapp.com/invite/hoge",

      "http://discord.gg/hoge",
      "http://discord.com/invite/hoge",

      "https://discord.gg/hoge",
      "https://discord.com/invite/hoge",

      "http://\\canary.diScordApP.com\\google.com⁂⌘∮/..\\/invite\\/youtube.com‖∠∇\\../twitter.com⁑∋〻\\../\\../hoge",
      "https://\\canary.diScordApP.com\\google.com⁂⌘∮/..\\/invite\\/youtube.com‖∠∇\\../twitter.com⁑∋〻\\../\\../hoge",

      "discord.gg/fuga",
      "discord.com/invite/fuga",
      "discordapp.com/invite/fuga",
      "http://discord.gg/fuga",
      "http://discord.com/invite/fuga",
      "https://discord.gg/fuga",
      "https://discord.com/invite/fuga",
      "http://\\canary.diScordApP.com\\google.com⁂⌘∮/..\\/invite\\/youtube.com‖∠∇\\../twitter.com⁑∋〻\\../\\../fuga",
      "https://\\canary.diScordApP.com\\google.com⁂⌘∮/..\\/invite\\/youtube.com‖∠∇\\../twitter.com⁑∋〻\\../\\../fuga",
    ]);
  });
});
