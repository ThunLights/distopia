import { AppCore } from "app-core";
import type { AppState } from "app-core/AppState";
import { DiscordAPIError, RESTJSONErrorCodes, type MessageComponentInteraction } from "discord.js";
import { describe, expect, test, vi } from "vitest";

import { MessageComponentInteractionBase } from "./MessageComponentInteractionBase";

class TestComponent extends MessageComponentInteractionBase<MessageComponentInteraction, void> {
  public readonly customId = "test-component";

  public override async run(_interaction: MessageComponentInteraction) {}

  public async testSafeUpdate(interaction: MessageComponentInteraction, options: object) {
    return await this.safeUpdate(interaction, options);
  }

  public async testSafeEditReply(interaction: MessageComponentInteraction, options: object) {
    return await this.safeEditReply(interaction, options);
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

describe("MessageComponentInteractionBase", () => {
  test("match compares customId", async () => {
    const component = new TestComponent(new AppCore({} as AppState));

    expect(
      await component.match({ customId: "test-component" } as MessageComponentInteraction),
    ).toBe(true);
    expect(
      await component.match({ customId: "other-component" } as MessageComponentInteraction),
    ).toBe(false);
  });

  describe("safeUpdate", () => {
    test("calls interaction.update when the original message still exists", async () => {
      const component = new TestComponent(new AppCore({} as AppState));
      const update = vi.fn().mockResolvedValue("updated");
      const reply = vi.fn();
      const interaction = {
        message: { fetch: async () => ({}) },
        update,
        reply,
      } as unknown as MessageComponentInteraction;

      const result = await component.testSafeUpdate(interaction, { content: "hi" });

      expect(update).toHaveBeenCalledWith({ content: "hi" });
      expect(reply).not.toHaveBeenCalled();
      expect(result).toBe("updated");
    });

    test("falls back to interaction.reply when the original message was deleted", async () => {
      const component = new TestComponent(new AppCore({} as AppState));
      const update = vi.fn();
      const reply = vi.fn().mockResolvedValue("replied");
      const interaction = {
        message: {
          fetch: async () => {
            throw unknownMessageError();
          },
        },
        update,
        reply,
      } as unknown as MessageComponentInteraction;

      const result = await component.testSafeUpdate(interaction, { content: "hi" });

      expect(update).not.toHaveBeenCalled();
      expect(reply).toHaveBeenCalledWith({ content: "hi" });
      expect(result).toBe("replied");
    });
  });

  describe("safeEditReply", () => {
    test("calls interaction.editReply when the original message still exists", async () => {
      const component = new TestComponent(new AppCore({} as AppState));
      const editReply = vi.fn().mockResolvedValue("edited");
      const followUp = vi.fn();
      const interaction = {
        message: { fetch: async () => ({}) },
        editReply,
        followUp,
      } as unknown as MessageComponentInteraction;

      await component.testSafeEditReply(interaction, { content: "hi" });

      expect(editReply).toHaveBeenCalledWith({ content: "hi" });
      expect(followUp).not.toHaveBeenCalled();
    });

    test("falls back to interaction.followUp when the original message was deleted", async () => {
      const component = new TestComponent(new AppCore({} as AppState));
      const editReply = vi.fn();
      const followUp = vi.fn().mockResolvedValue("followed up");
      const interaction = {
        message: {
          fetch: async () => {
            throw unknownMessageError();
          },
        },
        editReply,
        followUp,
      } as unknown as MessageComponentInteraction;

      await component.testSafeEditReply(interaction, { content: "hi" });

      expect(editReply).not.toHaveBeenCalled();
      expect(followUp).toHaveBeenCalledWith({ content: "hi" });
    });
  });
});
