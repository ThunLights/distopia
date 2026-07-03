import { AppCore } from "app-core";
import type { AppState } from "app-core/AppState";
import {
  MessageFlags,
  type CommandInteraction,
  type Guild,
  type GuildChannelResolvable,
  type PermissionsBitField,
} from "discord.js";
import { describe, expect, test } from "vitest";

import { ValidateError, type ValidateResult } from "../../../utils/validator";
import { CommandInteractionBase } from "./CommanInteractionBase";

type Options = { value: string };

class TestCommand extends CommandInteractionBase<Options, CommandInteraction> {
  public execCallCount = 0;

  public override async match(_interaction: CommandInteraction): Promise<boolean> {
    return true;
  }

  public override async parseOptions(
    _interaction: CommandInteraction,
  ): Promise<ValidateResult<Options>> {
    return { value: "ok" };
  }

  protected override async exec(_interaction: CommandInteraction, options: Options) {
    this.execCallCount++;
    return options.value;
  }
}

class InvalidOptionsCommand extends TestCommand {
  public override async parseOptions(
    _interaction: CommandInteraction,
  ): Promise<ValidateResult<Options>> {
    return new ValidateError({ content: "invalid" });
  }
}

function buildInteraction(permissionsGranted: boolean): CommandInteraction {
  return {
    channelId: "123",
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
  } as unknown as CommandInteraction;
}

describe("CommandInteractionBase", () => {
  test("runs exec and returns its result when permission is granted", async () => {
    const command = new TestCommand(new AppCore({} as AppState));

    const result = await command.run(buildInteraction(true));

    expect(result).toBe("ok");
    expect(command.execCallCount).toBe(1);
  });

  test("returns an ephemeral permission error and never calls exec when permission is denied", async () => {
    const command = new TestCommand(new AppCore({} as AppState));

    const result = await command.run(buildInteraction(false));

    expect(result).toEqual(
      expect.objectContaining({
        flags: [MessageFlags.Ephemeral],
      }),
    );
    expect(command.execCallCount).toBe(0);
  });

  test("does not run exec when options fail validation, even with permission granted", async () => {
    const command = new InvalidOptionsCommand(new AppCore({} as AppState));

    const result = await command.run(buildInteraction(true));

    expect(result).toEqual({ content: "invalid" });
    expect(command.execCallCount).toBe(0);
  });
});
