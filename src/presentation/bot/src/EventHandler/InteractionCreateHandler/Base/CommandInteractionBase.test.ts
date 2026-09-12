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
import { CommandInteractionBase } from "./CommandInteractionBase";

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

// R explicitly narrowed to just `string` (unlike TestCommand above, which relies on the
// default R union that already includes InteractionReplyOptions) -- exercises that run()'s
// permission-denial reply is still type-safe, not force-cast, when a subclass's own success
// type doesn't include InteractionReplyOptions.
class StrictStringCommand extends CommandInteractionBase<Options, CommandInteraction, string> {
  public override async match(_interaction: CommandInteraction): Promise<boolean> {
    return true;
  }

  public override async parseOptions(
    _interaction: CommandInteraction,
  ): Promise<ValidateResult<Options>> {
    return { value: "ok" };
  }

  protected override async exec(_interaction: CommandInteraction, options: Options) {
    return options.value;
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

  test("returns an ephemeral permission error when R is narrowed to string", async () => {
    const command = new StrictStringCommand(new AppCore({} as AppState));

    const result = await command.run(buildInteraction(false));

    expect(result).toEqual(
      expect.objectContaining({
        flags: [MessageFlags.Ephemeral],
      }),
    );
  });
});
