import { AppCore } from "app-core";
import type { AppState } from "app-core/AppState";
import {
  MessageFlags,
  type Guild,
  type GuildChannelResolvable,
  type PermissionsBitField,
  type StringSelectMenuInteraction,
} from "discord.js";
import { describe, expect, test } from "vitest";

import { StringSelectMenuInteractionBase } from "./StringSelectMenuInteractionBase";

class TestStringSelectMenu extends StringSelectMenuInteractionBase {
  public readonly customId = "test-string-select";
  public execCallCount = 0;

  protected override async exec(
    _interaction: StringSelectMenuInteraction,
    options: { value: string },
  ) {
    this.execCallCount++;
    return options.value;
  }
}

function buildInteraction(
  permissionsGranted: boolean,
  values: string[] = ["foo"],
): StringSelectMenuInteraction {
  return {
    customId: "test-string-select",
    channelId: "123",
    values,
    guild: {
      members: {
        me: {
          permissions: {
            has(_permission, _checkAdmin) {
              return permissionsGranted;
            },
          },
          permissionsIn(_channel: GuildChannelResolvable) {
            return {
              has(_permission, _checkAdmin) {
                return permissionsGranted;
              },
            };
          },
        },
      },
    } as Guild,
    memberPermissions: {
      has(_permission, _checkAdmin) {
        return permissionsGranted;
      },
    } as PermissionsBitField,
  } as unknown as StringSelectMenuInteraction;
}

describe("StringSelectMenuInteractionBase", () => {
  test("runs exec and returns its result when permission is granted", async () => {
    const menu = new TestStringSelectMenu(new AppCore({} as AppState));

    const result = await menu.run(buildInteraction(true, ["foo"]));

    expect(result).toBe("foo");
    expect(menu.execCallCount).toBe(1);
  });

  test("returns an ephemeral permission error and never calls exec when permission is denied", async () => {
    const menu = new TestStringSelectMenu(new AppCore({} as AppState));

    const result = await menu.run(buildInteraction(false, ["foo"]));

    expect(result).toEqual(
      expect.objectContaining({
        flags: [MessageFlags.Ephemeral],
      }),
    );
    expect(menu.execCallCount).toBe(0);
  });
});
