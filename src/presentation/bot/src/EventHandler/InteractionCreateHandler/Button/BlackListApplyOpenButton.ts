import {
  LabelBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
  type CacheType,
  type PermissionResolvable,
} from "discord.js";
import { ButtonInteractionBase } from "presentation-bot-kit/base/ButtonInteractionBase";
import { ModalSended } from "presentation-bot-kit/base/Modal/ModalSended";

export class BlackListApplyOpenButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "blackListApplyOpen";

  protected override async exec(interaction: ButtonInteraction<CacheType>): Promise<ModalSended> {
    const modal = new ModalBuilder()
      .setCustomId("blackListApply")
      .setTitle("ブラックリストを適用")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("ブラックリストID")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("blackListId")
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
          ),
      );

    await interaction.showModal(modal);

    return new ModalSended();
  }
}
