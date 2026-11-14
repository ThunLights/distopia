import type { BotFeature } from "presentation-bot-kit/feature";

import { BackBlackListPageButton } from "./bot/Button/BackBlackListPageButton";
import { BackBlackListTagsPickListButton } from "./bot/Button/BackBlackListTagsPickListButton";
import { BackBlackListTargetManageDetailButton } from "./bot/Button/BackBlackListTargetManageDetailButton";
import { BackBlackListTargetManageEditorsButton } from "./bot/Button/BackBlackListTargetManageEditorsButton";
import { BackBlackListTargetManagePageButton } from "./bot/Button/BackBlackListTargetManagePageButton";
import { BlackListApplyOpenButton } from "./bot/Button/BlackListApplyOpenButton";
import { BlackListAutoBanOffButton } from "./bot/Button/BlackListAutoBanOffButton";
import { BlackListAutoBanOnButton } from "./bot/Button/BlackListAutoBanOnButton";
import { BlackListEditorPermissionOpenButton } from "./bot/Button/BlackListEditorPermissionOpenButton";
import { BlackListEditorRemoveButton } from "./bot/Button/BlackListEditorRemoveButton";
import { BlackListLogChannelResetButton } from "./bot/Button/BlackListLogChannelResetButton";
import { BlackListManageCreateOpenButton } from "./bot/Button/BlackListManageCreateOpenButton";
import { BlackListManageDeleteButton } from "./bot/Button/BlackListManageDeleteButton";
import { BlackListPageNavButton } from "./bot/Button/BlackListPageNavButton";
import { BlackListShowPageNavButton } from "./bot/Button/BlackListShowPageNavButton";
import { BlackListTagAddOpenButton } from "./bot/Button/BlackListTagAddOpenButton";
import { BlackListTagRemoveButton } from "./bot/Button/BlackListTagRemoveButton";
import { BlackListTagsManageOpenButton } from "./bot/Button/BlackListTagsManageOpenButton";
import { BlackListTargetEditOpenButton } from "./bot/Button/BlackListTargetEditOpenButton";
import { BlackListTargetManageDetailPageNavButton } from "./bot/Button/BlackListTargetManageDetailPageNavButton";
import { BlackListTargetManageEditorsOpenButton } from "./bot/Button/BlackListTargetManageEditorsOpenButton";
import { BlackListTargetManageEditorsPageNavButton } from "./bot/Button/BlackListTargetManageEditorsPageNavButton";
import { BlackListTargetManagePageNavButton } from "./bot/Button/BlackListTargetManagePageNavButton";
import { BlackListTargetManageRemoveButton } from "./bot/Button/BlackListTargetManageRemoveButton";
import { BlackListUnapplyButton } from "./bot/Button/BlackListUnapplyButton";
import { BlackListLogChannelSelectMenu } from "./bot/ChannelSelectMenu/BlackListLogChannelSelectMenu";
import { BlackListCommand } from "./bot/ChatInputCommand/BlackListCommand";
import { BlackListApplyModal } from "./bot/Modal/BlackListApplyModal";
import { BlackListEditorPermissionModal } from "./bot/Modal/BlackListEditorPermissionModal";
import { BlackListManageCreateModal } from "./bot/Modal/BlackListManageCreateModal";
import { BlackListTagAddModal } from "./bot/Modal/BlackListTagAddModal";
import { BlackListTargetAddModal } from "./bot/Modal/BlackListTargetAddModal";
import { BlackListTargetEditModal } from "./bot/Modal/BlackListTargetEditModal";
import { blackListPage } from "./bot/Page/BlackListPage";
import { BlackListBanTagsSelectMenu } from "./bot/StringSelectMenu/BlackListBanTagsSelectMenu";
import { BlackListManageSelectMenu } from "./bot/StringSelectMenu/BlackListManageSelectMenu";
import { BlackListTagPickSelectMenu } from "./bot/StringSelectMenu/BlackListTagPickSelectMenu";
import { BlackListTagsPickListSelectMenu } from "./bot/StringSelectMenu/BlackListTagsPickListSelectMenu";
import { BlackListTargetPickEditorSelectMenu } from "./bot/StringSelectMenu/BlackListTargetPickEditorSelectMenu";
import { BlackListTargetPickListSelectMenu } from "./bot/StringSelectMenu/BlackListTargetPickListSelectMenu";
import { BlackListTargetPickManageSelectMenu } from "./bot/StringSelectMenu/BlackListTargetPickManageSelectMenu";
import { BlackListTargetPickAddEditorSelectMenu } from "./bot/UserSelectMenu/BlackListTargetPickAddEditorSelectMenu";
import { BlackListTargetPickAddUserSelectMenu } from "./bot/UserSelectMenu/BlackListTargetPickAddUserSelectMenu";

const feature: BotFeature = {
  button: [
    BackBlackListPageButton,
    BackBlackListTagsPickListButton,
    BackBlackListTargetManageDetailButton,
    BackBlackListTargetManageEditorsButton,
    BackBlackListTargetManagePageButton,
    BlackListApplyOpenButton,
    BlackListAutoBanOffButton,
    BlackListAutoBanOnButton,
    BlackListEditorPermissionOpenButton,
    BlackListEditorRemoveButton,
    BlackListLogChannelResetButton,
    BlackListManageCreateOpenButton,
    BlackListManageDeleteButton,
    BlackListPageNavButton,
    BlackListShowPageNavButton,
    BlackListTagAddOpenButton,
    BlackListTagRemoveButton,
    BlackListTagsManageOpenButton,
    BlackListTargetEditOpenButton,
    BlackListTargetManageDetailPageNavButton,
    BlackListTargetManageEditorsOpenButton,
    BlackListTargetManageEditorsPageNavButton,
    BlackListTargetManagePageNavButton,
    BlackListTargetManageRemoveButton,
    BlackListUnapplyButton,
  ],
  channelSelectMenu: [BlackListLogChannelSelectMenu],
  chatInput: [BlackListCommand],
  modal: [
    BlackListApplyModal,
    BlackListEditorPermissionModal,
    BlackListManageCreateModal,
    BlackListTagAddModal,
    BlackListTargetAddModal,
    BlackListTargetEditModal,
  ],
  stringSelectMenu: [
    BlackListBanTagsSelectMenu,
    BlackListManageSelectMenu,
    BlackListTagPickSelectMenu,
    BlackListTagsPickListSelectMenu,
    BlackListTargetPickEditorSelectMenu,
    BlackListTargetPickListSelectMenu,
    BlackListTargetPickManageSelectMenu,
  ],
  userSelectMenu: [BlackListTargetPickAddEditorSelectMenu, BlackListTargetPickAddUserSelectMenu],
  settings: [{ label: "ブラックリスト設定", value: "blackList", page: blackListPage }],
};

export default feature;
