import type { AppCore } from "app-core";
import type { EmbedBuilder, InteractionReplyOptions } from "discord.js";
import type { Guild } from "domain-model";
import { describe, expect, it } from "vitest";

import { addSettings, findSettings, settingsPage } from "./settings";

const core = {} as AppCore;
const guild = { id: "1" } as Guild;
const page = async (): Promise<InteractionReplyOptions> => ({ content: "page" });

describe("settings registry", () => {
  it("registers entries, rejects duplicates, and renders their fields on the panel", async () => {
    addSettings(
      { label: "A", value: "a", page, fields: async () => [{ name: "A field", value: "on" }] },
      { label: "B", value: "b", page },
    );

    expect(findSettings("b")?.label).toBe("B");
    expect(findSettings("missing")).toBeUndefined();
    expect(() => addSettings({ label: "A2", value: "a", page })).toThrow("Duplicate");

    const panel = await settingsPage(core, guild);
    const embed = panel.embeds?.[0] as EmbedBuilder;
    expect(embed.data.fields).toEqual([{ name: "A field", value: "on" }]);
    expect(JSON.stringify(panel.components)).toContain('"value":"b"');
  });
});
