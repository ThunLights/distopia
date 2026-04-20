import {
  ApplicationCommandOptionType,
  type CacheType,
  type ChatInputCommandInteraction,
  type Client,
  type InteractionReplyOptions,
  type MessagePayload,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "shared-lib/discord.js";
import { describe, expect, test } from "vitest";

import type { AppData } from "../../../model";
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
  const command = new Command({} as Client, {} as AppData);

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
      } as ChatInputCommandInteraction<CacheType>),
    ).toEqual({ content: "123456" + "foo" });
  });
});
