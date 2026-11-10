import { AppCore } from "app-core";
import type { AppState } from "app-core/AppState";
import {
  MessageFlags,
  type ChannelSelectMenuInteraction,
  type Guild,
  type GuildChannelResolvable,
  type PermissionsBitField,
} from "discord.js";
import { describe, expect, test } from "vitest";

import {
  ChannelSelectMenuInteractionBase,
  type OptionsSchema,
} from "./ChannelSelectMenuInteractionBase";

class TestChannelSelectMenu extends ChannelSelectMenuInteractionBase<typeof OptionsSchema> {
  public readonly customId = "test-channel-select";
  public execCallCount = 0;

  protected override async exec(
    _interaction: ChannelSelectMenuInteraction,
    options: { channelId: string },
  ) {
    this.execCallCount++;
    return options.channelId;
  }
}

function buildInteraction(
  permissionsGranted: boolean,
  values: string[] = ["123456"],
): ChannelSelectMenuInteraction {
  return {
    customId: "test-channel-select",
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
  } as unknown as ChannelSelectMenuInteraction;
}

describe("ChannelSelectMenuInteractionBase", () => {
  test("runs exec and returns its result when permission is granted", async () => {
    const menu = new TestChannelSelectMenu(new AppCore({} as AppState));

    const result = await menu.run(buildInteraction(true, ["123456"]));

    expect(result).toBe("123456");
    expect(menu.execCallCount).toBe(1);
  });

  test("returns an ephemeral permission error and never calls exec when permission is denied", async () => {
    const menu = new TestChannelSelectMenu(new AppCore({} as AppState));

    const result = await menu.run(buildInteraction(false, ["123456"]));

    expect(result).toEqual(
      expect.objectContaining({
        flags: [MessageFlags.Ephemeral],
      }),
    );
    expect(menu.execCallCount).toBe(0);
  });

  test("checks permission before validating options: an invalid channelId with denied permission still yields a permission error", async () => {
    const menu = new TestChannelSelectMenu(new AppCore({} as AppState));

    const result = await menu.run(buildInteraction(false, ["not-a-channel-id"]));

    expect(result).toEqual(
      expect.objectContaining({
        flags: [MessageFlags.Ephemeral],
      }),
    );
    expect(menu.execCallCount).toBe(0);
  });

  test("does not run exec when the selected value fails schema validation", async () => {
    const menu = new TestChannelSelectMenu(new AppCore({} as AppState));

    const result = await menu.run(buildInteraction(true, ["not-a-channel-id"]));

    expect(menu.execCallCount).toBe(0);
    expect(result).not.toBe("not-a-channel-id");
  });
});
