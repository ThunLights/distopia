import type { BotFeature } from "presentation-bot-kit/feature";

import { BackWelcomeMessagePageButton } from "./bot/Button/BackWelcomeMessagePageButton";
import { WelcomeMessageContentSubmitButton } from "./bot/Button/WelcomeMessageContentSubmitButton";
import { WelcomeMessageResetButton } from "./bot/Button/WelcomeMessageResetButton";
import { WelcomeMessageChannelSelectMenu } from "./bot/ChannelSelectMenu/WelcomeMessageChannelSelectMenu";
import { GuildMemberAddEvent } from "./bot/Event/GuildMemberAdd";
import { GuildMemberRemoveEvent } from "./bot/Event/GuildMemberRemove";
import { WelcomeMessageContentModal } from "./bot/Modal/WelcomeMessageContentModal";
import { welcomeMessagePage } from "./bot/Page/WelcomeMessagePage";
import { WelcomeMessageCategorySelectMenu } from "./bot/StringSelectMenu/WelcomeMessageCategorySelectMenu";

const feature: BotFeature = {
  button: [
    BackWelcomeMessagePageButton,
    WelcomeMessageContentSubmitButton,
    WelcomeMessageResetButton,
  ],
  channelSelectMenu: [WelcomeMessageChannelSelectMenu],
  modal: [WelcomeMessageContentModal],
  stringSelectMenu: [WelcomeMessageCategorySelectMenu],
  settings: [{ label: "入退出メッセージ設定", value: "welcomeMessage", page: welcomeMessagePage }],
  events: [GuildMemberAddEvent, GuildMemberRemoveEvent],
};

export default feature;
