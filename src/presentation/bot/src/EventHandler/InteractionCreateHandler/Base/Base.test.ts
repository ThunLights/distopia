import { AppCore } from "app-core";
import type { AppState } from "app-core/AppState";
import merge from "deepmerge";
import {
  DiscordAPIError,
  RESTJSONErrorCodes,
  type BaseInteraction,
  type CacheType,
  type Guild,
  type GuildChannelResolvable,
  type Message,
  type PermissionsBitField,
} from "discord.js";
import { describe, expect, suite, test } from "vitest";

import { Base } from "./Base";
import { PermissionSuccess } from "./Permission/PermissionSuccess";

class TestCommand extends Base<BaseInteraction> {
  public override async match(_interaction: BaseInteraction<CacheType>): Promise<boolean> {
    return true;
  }

  public override async run(_interaction: BaseInteraction<CacheType>): Promise<void> {}

  public async test(interaction: BaseInteraction<CacheType>) {
    return (await this.checkPermission(interaction)) instanceof PermissionSuccess;
  }

  public async testMessageExists(message: Message) {
    return await this.messageExists(message);
  }
}

function unknownMessageError() {
  return new DiscordAPIError(
    { message: "Unknown Message", code: RESTJSONErrorCodes.UnknownMessage },
    RESTJSONErrorCodes.UnknownMessage,
    404,
    "GET",
    "/channels/1/messages/1",
    { body: undefined, files: undefined },
  );
}

const testCommand = new TestCommand(new AppCore({} as AppState));

const interactionForPermissionCheck = {
  channelId: "123",
  guild: {
    members: {
      me: {
        permissions: {
          has(_permission, _checkAdmin) {
            return true;
          },
        },
        permissionsIn(_channel: GuildChannelResolvable) {
          return {
            has(_permission, _checkAdmin) {
              return true;
            },
          };
        },
      },
    },
  } as Guild,
  memberPermissions: {
    has(_permission, _checkAdmin) {
      return true;
    },
  } as PermissionsBitField,
} as unknown as BaseInteraction;

describe("Base.ts", () => {
  describe("PermissionCheck", () => {
    test("valid permissions", async () => {
      expect(await testCommand.test(interactionForPermissionCheck)).toBe(true);
    });

    suite("requireBotGuildPermissions", async () => {
      test("invalid permission", async () => {
        expect(
          await testCommand.test(
            merge<BaseInteraction>(interactionForPermissionCheck, {
              guild: {
                members: {
                  me: {
                    permissions: {
                      has(_permission, _checkAdmin) {
                        return false;
                      },
                    },
                  },
                },
              } as Guild,
            } as BaseInteraction),
          ),
        ).toBe(false);
      });
    });

    suite("requireBotChannelPermissions", async () => {
      test("channelId: null", async () => {
        expect(
          await testCommand.test(
            merge<BaseInteraction>(interactionForPermissionCheck, {
              channelId: null,
            } as BaseInteraction),
          ),
        ).toBe(false);
      });
      test("invalid permission", async () => {
        expect(
          await testCommand.test(
            merge<BaseInteraction>(interactionForPermissionCheck, {
              guild: {
                members: {
                  me: {
                    permissionsIn(_channel: GuildChannelResolvable) {
                      return {
                        has(_permission, _checkAdmin) {
                          return false;
                        },
                      };
                    },
                  },
                },
              } as Guild,
            } as BaseInteraction),
          ),
        ).toBe(false);
      });
    });

    suite("requireUserGuildPermissions", async () => {
      test("invalid permission", async () => {
        expect(
          await testCommand.test(
            merge<BaseInteraction>(interactionForPermissionCheck, {
              memberPermissions: {
                has(_permission, _checkAdmin) {
                  return false;
                },
              } as PermissionsBitField,
            } as BaseInteraction),
          ),
        ).toBe(false);
      });
    });
  });

  describe("messageExists", () => {
    test("returns true when the message can be fetched", async () => {
      const message = { fetch: async () => ({}) } as unknown as Message;

      expect(await testCommand.testMessageExists(message)).toBe(true);
    });

    test("returns false when the message was deleted", async () => {
      const message = {
        fetch: async () => {
          throw unknownMessageError();
        },
      } as unknown as Message;

      expect(await testCommand.testMessageExists(message)).toBe(false);
    });

    test("rethrows unrelated errors", async () => {
      const message = {
        fetch: async () => {
          throw new Error("network error");
        },
      } as unknown as Message;

      await expect(testCommand.testMessageExists(message)).rejects.toThrow("network error");
    });
  });
});
