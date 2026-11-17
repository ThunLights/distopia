import type { BotFeature } from "presentation-bot-kit/feature";

import { ActingOwnerResetButton } from "./bot/Button/ActingOwnerResetButton";
import { actingOwnerPage } from "./bot/Page/ActingOwnerPage";
import { ActingOwnerSelectMenu } from "./bot/UserSelectMenu/ActingOwnerSelectMenu";

const feature: BotFeature = {
  button: [ActingOwnerResetButton],
  userSelectMenu: [ActingOwnerSelectMenu],
  settings: [
    {
      label: "代理オーナー設定",
      value: "actingOwner",
      page: actingOwnerPage,
      fields: async (core, guild) => {
        const settings = await core.guild.getSetting(guild.id);
        return [
          {
            name: "オーナー代理",
            value: settings?.actingOwner ? `<@${settings.actingOwner}>` : "未設定",
          },
        ];
      },
    },
  ],
};

export default feature;
