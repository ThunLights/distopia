import { AppCore } from "app-core";
import type { AppState } from "app-core/AppState";
import {
  ApplicationCommandOptionType,
  Guild,
  type CacheType,
  type ChatInputCommandInteraction,
  type GuildChannelResolvable,
  type InteractionReplyOptions,
  type MessagePayload,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { describe, expect, test } from "vitest";

import { ChatInputCommandBase } from "./ChatInputCommandBase";

type Options = {
  data: string;
};

class Command extends ChatInputCommandBase<Options> {
  public override regist: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "hoge",
    description: "huga",
    options: [
      {
        name: "data",
        description: "data",
        type: ApplicationCommandOptionType.String,
      },
    ],
  };

  public override async parseOptions(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<Options> {
    return {
      data: interaction.options.getString("data", true),
    };
  }

  protected override async exec(
    interaction: ChatInputCommandInteraction<CacheType>,
    options: Options,
  ): Promise<string | InteractionReplyOptions | MessagePayload> {
    return { content: interaction.id + options.data };
  }
}

describe("ChatInputCommandBase", () => {
  const command = new Command(new AppCore({} as AppState));

  test("match", async () => {
    expect(
      await command.match({
        id: "123456",
        commandName: "hoge",
      } as ChatInputCommandInteraction<CacheType>),
    ).toBe(true);
    expect(
      await command.match({
        id: "123456",
        commandName: "huga",
      } as ChatInputCommandInteraction<CacheType>),
    ).toBe(false);
  });

  test("exec", async () => {
    expect(
      await command.run({
        id: "123456",
        commandName: "huga",
        options: {
          getString: (name) => (name === "data" ? "foo" : "Error"),
        },
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
      } as ChatInputCommandInteraction<CacheType>),
    ).toEqual({ content: "123456" + "foo" });
  });
});
