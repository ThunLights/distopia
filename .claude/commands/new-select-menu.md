---
description: Scaffold a new Discord select menu interaction handler (string, user, or role)
---

Scaffold a new Discord select menu handler. The menu type, customId, and purpose are: $ARGUMENTS

## Choose the menu type

| Type | Base class | Directory | Registry file |
|---|---|---|---|
| String select | `StringSelectMenuInteractionBase` | `StringSelectMenu/` | `StringSelectMenus.auto.ts` |
| User select | `UserSelectMenuInteractionBase` | `UserSelectMenu/` | `UserSelectMenus.auto.ts` |
| Role select | `RoleSelectMenuInteractionBase` | `RoleSelectMenu/` | `RoleSelectMenus.auto.ts` |

---

## Steps

### 1. Create the handler file

**String select** (`src/presentation/bot/src/EventHandler/InteractionCreateHandler/StringSelectMenu/<Name>StringSelectMenu.ts`):

```typescript
import {
  MessageFlags,
  type AnySelectMenuInteraction,
  type CacheType,
  type InteractionResponse,
  type InteractionUpdateOptions,
  type PermissionResolvable,
} from "discord.js";
import { StringSelectMenuInteractionBase } from "../Base/StringSelectMenuInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";

export class <Name>StringSelectMenu extends StringSelectMenuInteractionBase {
  // Remove this line if no permission check is needed
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "<customId>";

  protected override async exec(
    interaction: AnySelectMenuInteraction<CacheType>,
    values: string[],
  ): Promise<InteractionUpdateOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);
    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    // values[0] is the selected option value
    // implement logic here

    return await interaction.update({ content: "Done.", components: [] });
  }
}
```

**User select** (`src/presentation/bot/src/EventHandler/InteractionCreateHandler/UserSelectMenu/<Name>UserSelectMenu.ts`):

```typescript
import {
  MessageFlags,
  type AnySelectMenuInteraction,
  type CacheType,
  type InteractionResponse,
  type InteractionUpdateOptions,
  type PermissionResolvable,
} from "discord.js";
import { UserSelectMenuInteractionBase } from "../Base/UserSelectMenuInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";

export class <Name>UserSelectMenu extends UserSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "<customId>";

  protected override async exec(
    interaction: AnySelectMenuInteraction<CacheType>,
    values: string[], // selected user IDs
  ): Promise<InteractionUpdateOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);
    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    // values contains selected user IDs as strings
    const selectedUserId = values[0];

    return await interaction.update({ content: `Selected: <@${selectedUserId}>`, components: [] });
  }
}
```

**Role select** (`src/presentation/bot/src/EventHandler/InteractionCreateHandler/RoleSelectMenu/<Name>RoleSelectMenu.ts`):

```typescript
import {
  MessageFlags,
  type AnySelectMenuInteraction,
  type CacheType,
  type InteractionResponse,
  type InteractionUpdateOptions,
  type PermissionResolvable,
} from "discord.js";
import { RoleSelectMenuInteractionBase } from "../Base/RoleSelectMenuInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";

export class <Name>RoleSelectMenu extends RoleSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "<customId>";

  protected override async exec(
    interaction: AnySelectMenuInteraction<CacheType>,
    values: string[], // selected role IDs
  ): Promise<InteractionUpdateOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);
    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const selectedRoleId = values[0];

    return await interaction.update({ content: `Selected: <@&${selectedRoleId}>`, components: [] });
  }
}
```

### 2. Rebuild to regenerate the registry

```bash
cd docker && docker compose exec app sudo bun run build
```

This updates `StringSelectMenus.auto.ts`, `UserSelectMenus.auto.ts`, or `RoleSelectMenus.auto.ts` as appropriate.

### 3. Run type check

```bash
cd docker && docker compose exec app sudo bun run typecheck
```

## Notes

- `customId` must be unique across **all** select menu handlers (string, user, and role)
- `values` is an array of selected option values / user IDs / role IDs
- Use `interaction.update(...)` (not `interaction.reply(...)`) when the menu is part of an existing message component
- To build the select menu component itself for use in a message, create a matching factory in `src/EventHandler/InteractionCreateHandler/Component/`
