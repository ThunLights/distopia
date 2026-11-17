import type { BotFeature } from "presentation-bot-kit/feature";

import { BackBumpPageButton } from "./bot/Button/BackBumpPageButton";
import { BumpNoticeContentResetButton } from "./bot/Button/BumpNoticeContentResetButton";
import { BumpNoticeContentSubmitButton } from "./bot/Button/BumpNoticeContentSubmitButton";
import { BumpNoticeOffButton } from "./bot/Button/BumpNoticeOffButton";
import { BumpNoticeOnButton } from "./bot/Button/BumpNoticeOnButton";
import { BumpRoleResetButton } from "./bot/Button/BumpRoleResetButton";
import { BumpCommand } from "./bot/ChatInputCommand/BumpCommand";
import { ClientReadyEvent } from "./bot/Event/ClientReady";
import { BumpNoticeContentModal } from "./bot/Modal/BumpNoticeContentModal";
import { bumpPage } from "./bot/Page/BumpPage";
import { BumpRoleSelectMenu } from "./bot/RoleSelectMenu/BumpRoleSelectMenu";
import { BumpSettingSelectMenu } from "./bot/StringSelectMenu/BumpSettingSelectMenu";

const feature: BotFeature = {
  chatInput: [BumpCommand],
  button: [
    BackBumpPageButton,
    BumpNoticeContentResetButton,
    BumpNoticeContentSubmitButton,
    BumpNoticeOffButton,
    BumpNoticeOnButton,
    BumpRoleResetButton,
  ],
  modal: [BumpNoticeContentModal],
  roleSelectMenu: [BumpRoleSelectMenu],
  stringSelectMenu: [BumpSettingSelectMenu],
  settings: [
    {
      label: "Bump設定",
      value: "bump",
      page: bumpPage,
      fields: async (core, guild) => {
        const settings = await core.guild.getSetting(guild.id);
        return [
          { name: "Bump通知", value: settings?.bumpNotice ? "有効" : "無効" },
          {
            name: "Bump通知用ロール",
            value: settings?.bumpNoticeRole ? `<@&${settings.bumpNoticeRole}>` : "未設定",
          },
          { name: "Bump通知内容", value: settings?.bumpNoticeContent ?? "未設定" },
        ];
      },
    },
  ],
  events: [ClientReadyEvent],
};

export default feature;
