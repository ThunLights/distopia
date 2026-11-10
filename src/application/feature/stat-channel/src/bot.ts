import type { BotFeature } from "presentation-bot-kit/feature";

import { BackStatChannelPageButton } from "./bot/Button/BackStatChannelPageButton";
import { StatChannelActiveRateRankingResetButton } from "./bot/Button/StatChannelActiveRateRankingResetButton";
import { StatChannelActiveRateResetButton } from "./bot/Button/StatChannelActiveRateResetButton";
import { StatChannelAllMembersResetButton } from "./bot/Button/StatChannelAllMembersResetButton";
import { StatChannelBotsResetButton } from "./bot/Button/StatChannelBotsResetButton";
import { StatChannelBulkSetupButton } from "./bot/Button/StatChannelBulkSetupButton";
import { StatChannelUsersResetButton } from "./bot/Button/StatChannelUsersResetButton";
import { StatChannelActiveRateRankingSelectMenu } from "./bot/ChannelSelectMenu/StatChannelActiveRateRankingSelectMenu";
import { StatChannelActiveRateSelectMenu } from "./bot/ChannelSelectMenu/StatChannelActiveRateSelectMenu";
import { StatChannelAllMembersSelectMenu } from "./bot/ChannelSelectMenu/StatChannelAllMembersSelectMenu";
import { StatChannelBotsSelectMenu } from "./bot/ChannelSelectMenu/StatChannelBotsSelectMenu";
import { StatChannelUsersSelectMenu } from "./bot/ChannelSelectMenu/StatChannelUsersSelectMenu";
import { statChannelPage } from "./bot/StatChannelPage";
import { StatChannelSelectMenu } from "./bot/StringSelectMenu/StatChannelSelectMenu";
import { StatChannelSetupSelectMenu } from "./bot/StringSelectMenu/StatChannelSetupSelectMenu";

const feature: BotFeature = {
  button: [
    BackStatChannelPageButton,
    StatChannelActiveRateRankingResetButton,
    StatChannelActiveRateResetButton,
    StatChannelAllMembersResetButton,
    StatChannelBotsResetButton,
    StatChannelBulkSetupButton,
    StatChannelUsersResetButton,
  ],
  channelSelectMenu: [
    StatChannelActiveRateRankingSelectMenu,
    StatChannelActiveRateSelectMenu,
    StatChannelAllMembersSelectMenu,
    StatChannelBotsSelectMenu,
    StatChannelUsersSelectMenu,
  ],
  stringSelectMenu: [StatChannelSelectMenu, StatChannelSetupSelectMenu],
  settings: [{ label: "統計チャンネル設定", value: "statChannel", page: statChannelPage }],
};

export default feature;
