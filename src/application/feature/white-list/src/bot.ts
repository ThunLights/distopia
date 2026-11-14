import type { BotFeature } from "presentation-bot-kit/feature";

import { BackWhiteListPageButton } from "./bot/Button/BackWhiteListPageButton";
import { WhiteListDeleteButton } from "./bot/Button/WhiteListDeleteButton";
import { WhiteListAddChannelSelectMenu } from "./bot/ChannelSelectMenu/WhiteListAddChannelSelectMenu";
import { whiteListPage } from "./bot/Page/WhiteListPage";
import { WhiteListAddRoleSelectMenu } from "./bot/RoleSelectMenu/WhiteListAddRoleSelectMenu";
import { WhiteListEditActionSelectMenu } from "./bot/StringSelectMenu/WhiteListEditActionSelectMenu";
import { WhiteListManageSelectMenu } from "./bot/StringSelectMenu/WhiteListManageSelectMenu";
import { WhiteListAddUserSelectMenu } from "./bot/UserSelectMenu/WhiteListAddUserSelectMenu";

const feature: BotFeature = {
  button: [BackWhiteListPageButton, WhiteListDeleteButton],
  channelSelectMenu: [WhiteListAddChannelSelectMenu],
  roleSelectMenu: [WhiteListAddRoleSelectMenu],
  stringSelectMenu: [WhiteListEditActionSelectMenu, WhiteListManageSelectMenu],
  userSelectMenu: [WhiteListAddUserSelectMenu],
  settings: [{ label: "ホワイトリスト設定", value: "whiteList", page: whiteListPage }],
};

export default feature;
