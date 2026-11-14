import { EmbedBuilder } from "discord.js";
import { describe, expect, test } from "vitest";

import { buildRolePanel, rolePanelRoleIds } from "./rolePanel";

describe("rolePanel", () => {
  test("role IDs round-trip through the panel components", () => {
    const roles = [
      { id: "1", name: "a" },
      { id: "2", name: "b" },
    ];
    const panel = buildRolePanel(new EmbedBuilder().setTitle("t"), roles);
    // Mirror discord.js's received-message shape (camelCase customId).
    const components = panel.components.map((row) => {
      const { type, components } = row.toJSON();
      return {
        type,
        components: components.map(({ custom_id, ...rest }) => ({ ...rest, customId: custom_id })),
      };
    });

    expect(rolePanelRoleIds({ components } as never)).toEqual(["1", "2"]);
    expect(panel.embeds[0]!.toJSON().fields?.[0]?.value).toBe("🇦:<@&1>\n🇧:<@&2>");
  });

  test("returns null for messages without a panel", () => {
    expect(rolePanelRoleIds({ components: [] })).toBeNull();
  });
});
