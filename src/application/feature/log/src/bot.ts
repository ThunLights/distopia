import type { BotFeature } from "presentation-bot-kit/feature";

import { BackLogPageButton } from "./bot/Button/BackLogPageButton";
import { LogBulkClearButton } from "./bot/Button/LogBulkClearButton";
import { LogBulkSetButton } from "./bot/Button/LogBulkSetButton";
import { LogChannelResetButton } from "./bot/Button/LogChannelResetButton";
import { LogBulkSetChannelSelectMenu } from "./bot/ChannelSelectMenu/LogBulkSetChannelSelectMenu";
import { LogChannelSelectMenu } from "./bot/ChannelSelectMenu/LogChannelSelectMenu";
import { events } from "./bot/events";
import { logPage } from "./bot/Page/LogPage";
import { LogBulkClearFieldsSelectMenu } from "./bot/StringSelectMenu/LogBulkClearFieldsSelectMenu";
import { LogBulkSetFieldsSelectMenu } from "./bot/StringSelectMenu/LogBulkSetFieldsSelectMenu";
import { LogCategorySelectMenu } from "./bot/StringSelectMenu/LogCategorySelectMenu";

const feature: BotFeature = {
  button: [BackLogPageButton, LogBulkClearButton, LogBulkSetButton, LogChannelResetButton],
  channelSelectMenu: [LogBulkSetChannelSelectMenu, LogChannelSelectMenu],
  stringSelectMenu: [
    LogBulkClearFieldsSelectMenu,
    LogBulkSetFieldsSelectMenu,
    LogCategorySelectMenu,
  ],
  settings: [{ label: "ログ設定", value: "log", page: logPage }],
  events,
};

export default feature;
