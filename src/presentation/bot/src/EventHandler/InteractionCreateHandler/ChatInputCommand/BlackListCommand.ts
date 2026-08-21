import {
  CHARACTER_LIMIT,
  MAX_USER_BLACK_LIST_COUNT,
  NUM_BLACK_LIST_TAG_LIMIT,
} from "app-core/constant";
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  InteractionCallbackResponse,
  LabelBuilder,
  MessageFlags,
  MessagePayload,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionReplyOptions,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import z from "zod";

import {
  BlackListTagsSchema,
  buildBlackListFieldValue,
  encodeBlackListTargetRef,
  parseBlackListTagsInput,
  truncateSelectMenuLabel,
  type BlackListPermission,
} from "../../../utils/blackList";
import { validator, ValidateError, type ValidateResult } from "../../../utils/validator";
import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";
import { ModalSended } from "../Base/Modal/ModalSended";
import { blackListShowPage } from "../Page/BlackListShowPage";
import { blackListTargetManagePage } from "../Page/BlackListTargetManagePage";

const OptionsSchema = z.object({
  subCommandGroup: z.string().nullable(),
  subCommand: z.string(),
  blackListId: z.number().nullable(),
  userId: z.string().nullable(),
  label: z.string().nullable(),
  tags: z.string().nullable(),
  allPermissions: z.boolean().nullable(),
  addPermission: z.boolean().nullable(),
  editPermission: z.boolean().nullable(),
  removePermission: z.boolean().nullable(),
});

type Options = z.infer<typeof OptionsSchema>;

const blackListIdOption = {
  type: ApplicationCommandOptionType.Integer,
  name: "blacklist_id",
  description: "ブラックリストのID",
  required: true,
} as const;

const userOption = {
  type: ApplicationCommandOptionType.User,
  name: "user",
  description: "対象のユーザー",
  required: true,
} as const;

export class BlackListCommand extends ChatInputCommandBase<Options> {
  public override register: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "blacklist",
    description: "ブラックリストを管理します。",
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "create",
        description: "新しいブラックリストを作成します。",
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: "label",
            description: "ブラックリストの名前",
            required: true,
            max_length: CHARACTER_LIMIT.blackListLabel,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: "tags",
            description: `タグをカンマ区切りで指定 (最大${NUM_BLACK_LIST_TAG_LIMIT}個)`,
            required: false,
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "delete",
        description: "ブラックリストを削除します。(オーナーのみ)",
        options: [blackListIdOption],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "tags",
        description: `ブラックリストのタグを設定します。(最大${NUM_BLACK_LIST_TAG_LIMIT}個、オーナーのみ)`,
        options: [
          blackListIdOption,
          {
            type: ApplicationCommandOptionType.String,
            name: "tags",
            description: `タグをカンマ区切りで指定 (最大${NUM_BLACK_LIST_TAG_LIMIT}個)`,
            required: true,
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "list",
        description: "自分が所有・編集できるブラックリストの一覧を表示します。",
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "show",
        description: "ブラックリストに登録された対象の一覧を表示します。",
        options: [blackListIdOption],
      },
      {
        type: ApplicationCommandOptionType.SubcommandGroup,
        name: "target",
        description: "ブラックリストの対象を操作します。",
        options: [
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "manage",
            description: "セレクトメニューから対象を追加・編集・削除します。",
          },
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "add",
            description: "対象を追加します。",
            options: [blackListIdOption, userOption],
          },
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "edit",
            description: "対象の説明を編集します。",
            options: [blackListIdOption, userOption],
          },
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "remove",
            description: "対象を削除します。",
            options: [blackListIdOption, userOption],
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.SubcommandGroup,
        name: "editor",
        description: "編集権限を操作します。(オーナーのみ)",
        options: [
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "add",
            description: "編集者を追加・更新します。(オーナーのみ)",
            options: [
              blackListIdOption,
              userOption,
              {
                type: ApplicationCommandOptionType.Boolean,
                name: "all",
                description: "全ての操作を許可する",
                required: false,
              },
              {
                type: ApplicationCommandOptionType.Boolean,
                name: "add",
                description: "対象の追加を許可する",
                required: false,
              },
              {
                type: ApplicationCommandOptionType.Boolean,
                name: "edit",
                description: "対象の編集を許可する",
                required: false,
              },
              {
                type: ApplicationCommandOptionType.Boolean,
                name: "remove",
                description: "対象の削除を許可する",
                required: false,
              },
            ],
          },
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "remove",
            description: "編集者を削除します。(オーナーのみ)",
            options: [blackListIdOption, userOption],
          },
        ],
      },
    ],
  };

  public override async parseOptions(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<ValidateResult<Options>> {
    return await validator(
      {
        subCommandGroup: interaction.options.getSubcommandGroup(false),
        subCommand: interaction.options.getSubcommand(),
        blackListId: interaction.options.getInteger("blacklist_id", false),
        userId: interaction.options.getUser("user", false)?.id ?? null,
        label: interaction.options.getString("label", false),
        tags: interaction.options.getString("tags", false),
        allPermissions: interaction.options.getBoolean("all", false),
        addPermission: interaction.options.getBoolean("add", false),
        editPermission: interaction.options.getBoolean("edit", false),
        removePermission: interaction.options.getBoolean("remove", false),
      },
      OptionsSchema,
    );
  }

  protected override async exec(
    interaction: ChatInputCommandInteraction<CacheType>,
    options: Options,
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | InteractionCallbackResponse<boolean>
  > {
    const { subCommandGroup, subCommand, blackListId, userId } = options;
    const requesterId = interaction.user.id;

    if (subCommandGroup === "target" && subCommand === "manage") {
      return await blackListTargetManagePage(this.core, requesterId);
    }

    if (subCommandGroup === "target") {
      if (blackListId === null || userId === null) {
        return { content: "パラメーターが不足しています。", flags: [MessageFlags.Ephemeral] };
      }

      if (subCommand === "add" || subCommand === "edit") {
        const permission: BlackListPermission = subCommand === "add" ? "AddTarget" : "EditTarget";
        const allowed = await this.core.blackList.hasPermission(
          blackListId,
          requesterId,
          permission,
        );

        if (!allowed) {
          return {
            content: "このブラックリストを編集する権限がありません。",
            flags: [MessageFlags.Ephemeral],
          };
        }

        const existing =
          subCommand === "edit" ? await this.core.blackList.findTarget(blackListId, userId) : null;

        if (subCommand === "edit" && !existing) {
          return { content: "対象が見つかりませんでした。", flags: [MessageFlags.Ephemeral] };
        }

        const list = await this.core.blackList.find(blackListId);

        const modal = new ModalBuilder()
          .setCustomId(
            `${subCommand === "add" ? "blackListTargetAdd" : "blackListTargetEdit"}:${encodeBlackListTargetRef(blackListId, userId)}`,
          )
          .setTitle(subCommand === "add" ? "ブラックリストに追加" : "対象を編集")
          .addLabelComponents(
            new LabelBuilder().setLabel("ラベル").setTextInputComponent(
              new TextInputBuilder()
                .setCustomId("label")
                .setStyle(TextInputStyle.Short)
                .setMaxLength(CHARACTER_LIMIT.blackListLabel)
                .setValue(existing?.label ?? ""),
            ),
            new LabelBuilder().setLabel("説明").setTextInputComponent(
              new TextInputBuilder()
                .setCustomId("description")
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(CHARACTER_LIMIT.description)
                .setValue(existing?.description ?? ""),
            ),
          );

        if (list?.tags.length) {
          modal.addLabelComponents(
            new LabelBuilder().setLabel("タグ").setStringSelectMenuComponent(
              new StringSelectMenuBuilder()
                .setCustomId("tags")
                .setMinValues(0)
                .setMaxValues(list.tags.length)
                .addOptions(
                  list.tags.map((tag) =>
                    new StringSelectMenuOptionBuilder()
                      .setLabel(truncateSelectMenuLabel(tag))
                      .setValue(tag)
                      .setDefault(existing?.tags.includes(tag) ?? false),
                  ),
                ),
            ),
          );
        }

        await interaction.showModal(modal);
        return new ModalSended();
      }

      if (subCommand === "remove") {
        const allowed = await this.core.blackList.hasPermission(
          blackListId,
          requesterId,
          "RemoveTarget",
        );

        if (!allowed) {
          return {
            content: "このブラックリストを編集する権限がありません。",
            flags: [MessageFlags.Ephemeral],
          };
        }

        const existing = await this.core.blackList.findTarget(blackListId, userId);

        if (!existing) {
          return { content: "対象が見つかりませんでした。", flags: [MessageFlags.Ephemeral] };
        }

        await this.core.blackList.deleteTarget(blackListId, userId);
        return { content: "対象を削除しました。", flags: [MessageFlags.Ephemeral] };
      }
    }

    if (subCommandGroup === "editor") {
      if (blackListId === null || userId === null) {
        return { content: "パラメーターが不足しています。", flags: [MessageFlags.Ephemeral] };
      }

      const isOwner = await this.core.blackList.isOwner(blackListId, requesterId);

      if (!isOwner) {
        return {
          content: "編集権限の変更はブラックリストのオーナーのみ行えます。",
          flags: [MessageFlags.Ephemeral],
        };
      }

      if (subCommand === "add") {
        const permissions: BlackListPermission[] = [
          ...(options.addPermission ? (["AddTarget"] as const) : []),
          ...(options.editPermission ? (["EditTarget"] as const) : []),
          ...(options.removePermission ? (["RemoveTarget"] as const) : []),
        ];

        await this.core.blackList.upsertEditor({
          blackListId,
          userId,
          allPermissions: options.allPermissions ?? false,
          permissions,
        });

        return {
          content: `<@${userId}> を編集者として設定しました。`,
          flags: [MessageFlags.Ephemeral],
        };
      }

      if (subCommand === "remove") {
        await this.core.blackList.deleteEditor(blackListId, userId);
        return { content: "編集者を削除しました。", flags: [MessageFlags.Ephemeral] };
      }
    }

    if (subCommand === "create") {
      if (!options.label) {
        return { content: "パラメーターが不足しています。", flags: [MessageFlags.Ephemeral] };
      }

      if (!(await this.core.blackList.canCreate(requesterId))) {
        return {
          content: `作成できるブラックリストは${MAX_USER_BLACK_LIST_COUNT}個までです。`,
          flags: [MessageFlags.Ephemeral],
        };
      }

      const tags = await validator(
        parseBlackListTagsInput(options.tags ?? ""),
        BlackListTagsSchema,
      );

      if (tags instanceof ValidateError) {
        return tags.content;
      }

      const list = await this.core.blackList.create(requesterId, options.label, tags);
      return {
        content: `ブラックリストを作成しました。ID: \`${list.id}\` ラベル: ${list.label}`,
        flags: [MessageFlags.Ephemeral],
      };
    }

    if (subCommand === "tags") {
      if (blackListId === null || options.tags === null) {
        return { content: "パラメーターが不足しています。", flags: [MessageFlags.Ephemeral] };
      }

      const isOwner = await this.core.blackList.isOwner(blackListId, requesterId);

      if (!isOwner) {
        return {
          content: "タグの設定はブラックリストのオーナーのみ行えます。",
          flags: [MessageFlags.Ephemeral],
        };
      }

      const tags = await validator(parseBlackListTagsInput(options.tags), BlackListTagsSchema);

      if (tags instanceof ValidateError) {
        return tags.content;
      }

      await this.core.blackList.updateTags(blackListId, tags);
      return {
        content: `タグを更新しました。${tags.length ? tags.join(", ") : "(タグなし)"}`,
        flags: [MessageFlags.Ephemeral],
      };
    }

    if (subCommand === "delete") {
      if (blackListId === null) {
        return { content: "パラメーターが不足しています。", flags: [MessageFlags.Ephemeral] };
      }

      const isOwner = await this.core.blackList.isOwner(blackListId, requesterId);

      if (!isOwner) {
        return {
          content: "削除はブラックリストのオーナーのみ行えます。",
          flags: [MessageFlags.Ephemeral],
        };
      }

      await this.core.blackList.delete(blackListId);
      return { content: "ブラックリストを削除しました。", flags: [MessageFlags.Ephemeral] };
    }

    if (subCommand === "list") {
      const lists = await this.core.blackList.findAllEditable(requesterId);

      if (!lists.length) {
        return {
          content: "所有・編集できるブラックリストがありません。",
          flags: [MessageFlags.Ephemeral],
        };
      }

      const embed = new EmbedBuilder()
        .setColor("Navy")
        .setTitle("ブラックリスト一覧")
        .setDescription(
          buildBlackListFieldValue(
            lists.map(
              (list) =>
                `ID: \`${list.id}\` ${list.label} (${list.ownerId === requesterId ? "オーナー" : "編集者"})${list.tags.length ? ` [${list.tags.join(", ")}]` : ""}`,
            ),
          ),
        );

      return { embeds: [embed], flags: [MessageFlags.Ephemeral] };
    }

    if (subCommand === "show") {
      if (blackListId === null) {
        return { content: "パラメーターが不足しています。", flags: [MessageFlags.Ephemeral] };
      }

      return await blackListShowPage(this.core, blackListId, requesterId);
    }

    return {
      content: `${subCommand}は見つかりませんでした。`,
      flags: [MessageFlags.Ephemeral],
    };
  }
}
