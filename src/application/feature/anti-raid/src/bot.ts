import type { BotFeature } from "presentation-bot-kit/feature";

import { AntiRaidLogChannelResetButton } from "./bot/Button/AntiRaidLogChannelResetButton";
import { BackAntiRaidPageButton } from "./bot/Button/BackAntiRaidPageButton";
import { InviteLinkBlockOff } from "./bot/Button/InviteLinkBlockOff";
import { InviteLinkBlockOn } from "./bot/Button/InviteLinkBlockOn";
import { AntiRaidLogChannelSelectMenu } from "./bot/ChannelSelectMenu/AntiRaidLogChannelSelectMenu";
import { antiRaidPage } from "./bot/Page/AntiRaidPage";
import { AntiRaidSettingSelectMenu } from "./bot/StringSelectMenu/AntiRaidSettingSelectMenu";

const feature: BotFeature = {
  button: [
    AntiRaidLogChannelResetButton,
    BackAntiRaidPageButton,
    InviteLinkBlockOff,
    InviteLinkBlockOn,
  ],
  channelSelectMenu: [AntiRaidLogChannelSelectMenu],
  stringSelectMenu: [AntiRaidSettingSelectMenu],
  settings: [
    {
      label: "荒らし対策設定",
      value: "antiRaid",
      page: antiRaidPage,
      fields: async (core, guild) => {
        const settings = await core.guild.getSetting(guild.id);
        return [{ name: "招待リンクブロック", value: settings?.inviteLinkBlock ? "On" : "未設定" }];
      },
    },
  ],
};

export default feature;
