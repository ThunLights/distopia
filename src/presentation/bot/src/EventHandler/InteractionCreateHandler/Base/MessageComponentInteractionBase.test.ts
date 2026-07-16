import { AppCore } from "app-core";
import type { AppState } from "app-core/AppState";
import type { MessageComponentInteraction } from "discord.js";
import { describe, expect, test } from "vitest";

import { MessageComponentInteractionBase } from "./MessageComponentInteractionBase";

class TestComponent extends MessageComponentInteractionBase<MessageComponentInteraction, void> {
  public readonly customId = "test-component";

  public override async run(_interaction: MessageComponentInteraction) {}
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
});
