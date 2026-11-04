import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionReplyOptions,
  type PermissionResolvable,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  type Role,
} from "discord.js";
import z from "zod";

import {
  buildRolePanel,
  findLatestRolePanel,
  ROLE_PANEL_MAX_ROLES,
  rolePanelRoleIds,
} from "../../../utils/rolePanel";
import { validator, type ValidateResult } from "../../../utils/validator";
import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";

const roleOption = {
  type: ApplicationCommandOptionType.Role,
  name: "role",
  description: "対象の役職",
  required: true,
} as const;

const OptionsSchema = z.object({
  subCommand: z.enum(["create", "add", "remove"]),
  roleId: z.string().regex(/^\d+$/),
  title: z.string().max(256).nullable(),
  description: z.string().max(2000).nullable(),
});
type Options = z.infer<typeof OptionsSchema>;

const reply = (content: string): InteractionReplyOptions => ({
  content,
  flags: [MessageFlags.Ephemeral],
});

export class RolePanelCommand extends ChatInputCommandBase<Options> {
  public override requireBotGuildPermissions: PermissionResolvable[] = ["ManageRoles"];
  public override requireBotChannelPermissions: PermissionResolvable[] = [
    "ViewChannel",
    "SendMessages",
    "EmbedLinks",
    "ReadMessageHistory",
  ];
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];

  public override register: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "rolepanel",
    description: "役職パネルを管理します。",
    default_member_permissions: PermissionFlagsBits.Administrator.toString(),
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "create",
        description: "このチャンネルに役職パネルを作成します。",
        options: [
          roleOption,
          {
            type: ApplicationCommandOptionType.String,
            name: "title",
            description: "パネルのタイトル",
            required: false,
            max_length: 256,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: "description",
            description: "パネルの説明",
            required: false,
            max_length: 2000,
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "add",
        description: "このチャンネルの最新の役職パネルに役職を追加します。",
        options: [roleOption],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "remove",
        description: "このチャンネルの最新の役職パネルから役職を削除します。",
        options: [roleOption],
      },
    ],
  };

  public override async parseOptions(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<ValidateResult<Options>> {
    return await validator(
      {
        subCommand: interaction.options.getSubcommand(),
        roleId: interaction.options.getRole("role", true).id,
        title: interaction.options.getString("title", false),
        description: interaction.options.getString("description", false),
      },
      OptionsSchema,
    );
  }

  // Without this, an administrator could hand out roles above their own via a panel.
  private async checkRole(
    interaction: ChatInputCommandInteraction<CacheType>,
    role: Role,
  ): Promise<string | null> {
    if (role.managed || role.id === role.guild.id) {
      return "この役職はパネルに追加できません。";
    }
    if (!role.editable) {
      return "ボットの役職より上位の役職は追加できません。";
    }
    const member = await role.guild.members.fetch(interaction.user.id);
    if (role.guild.ownerId !== member.id && role.comparePositionTo(member.roles.highest) >= 0) {
      return "あなたの最上位の役職以上の役職は追加できません。";
    }
    return null;
  }

  protected override async exec(
    interaction: ChatInputCommandInteraction<CacheType>,
    options: Options,
  ): Promise<InteractionReplyOptions> {
    const { guild, channel } = interaction;
    const role = guild?.roles.cache.get(options.roleId);
    if (!guild || !channel?.isSendable() || channel.isDMBased() || !role) {
      return reply("このチャンネルでは実行できません。");
    }

    if (options.subCommand !== "remove") {
      const error = await this.checkRole(interaction, role);
      if (error) {
        return reply(error);
      }
    }

    const panel = await findLatestRolePanel(channel, interaction.client.user.id);

    if (options.subCommand === "create") {
      if (panel) {
        return reply(
          `このチャンネルには既に役職パネルがあります: ${panel.url}\n役職の追加は \`/rolepanel add\` を使用してください。`,
        );
      }
      const embed = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle(options.title ?? "役職パネル")
        .setDescription(options.description);
      await channel.send(buildRolePanel(embed, [role]));
      return reply("役職パネルを作成しました。");
    }

    const roleIds = panel && rolePanelRoleIds(panel);
    if (!panel || !roleIds) {
      return reply("このチャンネルに役職パネルが見つかりませんでした。");
    }

    const nextIds =
      options.subCommand === "add"
        ? [...new Set([...roleIds, role.id])]
        : roleIds.filter((id) => id !== role.id);
    if (nextIds.length > ROLE_PANEL_MAX_ROLES) {
      return reply(`1つのパネルに追加できる役職は${ROLE_PANEL_MAX_ROLES}個までです。`);
    }

    // Deleted roles drop out here, so every edit also refreshes the panel.
    const roles = nextIds.flatMap((id) => guild.roles.cache.get(id) ?? []);
    if (roles.length === 0) {
      await panel.delete();
      return reply("役職がなくなったため、パネルを削除しました。");
    }

    await panel.edit(buildRolePanel(EmbedBuilder.from(panel.embeds[0]!), roles));
    return reply(options.subCommand === "add" ? "役職を追加しました。" : "役職を削除しました。");
  }
}
