# presentation-bot — Codex Agent Guide

Package `presentation-bot` — Discord bot built with discord.js v14.

---

## Directory Structure

```
src/
├── EventHandler/
│   ├── GuildMemberAddHandler.ts       # member join
│   ├── MessageCreateHandler.ts        # message receive
│   └── InteractionCreateHandler/
│       ├── Base/                      # abstract base classes
│       │   ├── ChatInputCommandInteractionBase.ts
│       │   ├── ButtonInteractionBase.ts
│       │   ├── ModalInteractionBase.ts
│       │   ├── StringSelectMenuInteractionBase.ts
│       │   ├── UserSelectMenuInteractionBase.ts
│       │   ├── RoleSelectMenuInteractionBase.ts
│       │   └── Error/
│       │       └── GuildParseError.ts
│       ├── ChatInputCommand/           # slash commands
│       ├── Button/                     # button handlers
│       ├── Modal/                      # modal handlers
│       ├── Page/                       # pagination
│       ├── StringSelectMenu/           # string select menus
│       ├── UserSelectMenu/             # user select menus
│       └── RoleSelectMenu/             # role select menus
└── utils/
    └── validator.ts                    # Zod wrapper for Discord input validation
```

---

## auto.ts Files — Never Edit Manually

Files ending in `*.auto.ts` (`Buttons.auto.ts`, `ChatInputCommands.auto.ts`, `StringSelectMenus.auto.ts`, etc.) are **auto-generated** by `bun run build`. After adding or removing a handler class, run:

```bash
sudo bun run build
```

The build scans directories and regenerates these registry files automatically.

---

## Handler Pattern

All interaction handlers extend a base class and override `exec`. The base class handles routing, error replies, and permission checks.

```typescript
import { MessageFlags, type ChatInputCommandInteraction, type CacheType } from "discord.js";
import { ChatInputCommandInteractionBase } from "../Base/ChatInputCommandInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";

export class MyCommand extends ChatInputCommandInteractionBase {
  public override commandName: string = "my-command";
  // Optional: restrict to users with these guild permissions
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];

  protected override async exec(
    interaction: ChatInputCommandInteraction<CacheType>,
  ) {
    const guild = await this.parseGuild(interaction);
    if (guild instanceof GuildParseError) {
      return interaction.reply({ content: guild.message, flags: [MessageFlags.Ephemeral] });
    }

    // interaction.guildId is safe to use here (parseGuild validated it)
    await interaction.reply({ content: "Done." });
  }
}
```

The pattern is identical for `ButtonInteractionBase`, `ModalInteractionBase`, and all select menu bases — replace `exec` signature with the relevant interaction type.

---

## Select Menu Handlers

| Type | Base class | `exec` receives |
|---|---|---|
| String | `StringSelectMenuInteractionBase` | `interaction, values: string[]` |
| User | `UserSelectMenuInteractionBase` | `interaction, values: string[]` (user IDs) |
| Role | `RoleSelectMenuInteractionBase` | `interaction, values: string[]` (role IDs) |

- `customId` must be unique across **all** select menu handler types
- Use `interaction.update(...)` (not `reply`) when the menu is part of an existing message

---

## Validation (Zod + validator utility)

```typescript
import z from "zod";
import { validator, type ValidateResult } from "../../../utils/validator";

const OptionsSchema = z.object({
  message: z.string().min(1).max(2000),
  channelId: z.string().regex(/^\d+$/),
});
type Options = z.infer<typeof OptionsSchema>;

// In parseOptions():
return await validator(
  {
    message: interaction.fields.getTextInputValue("message"),
    channelId: interaction.fields.getTextInputValue("channelId"),
  },
  OptionsSchema,
);
// Returns Options | ValidationError
// The base class automatically sends a Discord error reply on ValidationError
```

---

## Lint and Format

This package uses **oxlint + oxfmt** (not ESLint/Prettier):

```bash
bun run lint
bun run format
```

Config is shared from `lib/template/` (`oxlint.config.ts`, `oxfmt.config.ts`).
`*.auto.ts` and `dist/**` are ignored by both tools.

---

## Commands (from devcontainer root)

```bash
sudo bun run build        # Build + regenerate auto.ts files
bun run test              # Unit tests (Vitest)
sudo bun run typecheck    # Type check
sudo bun run lint         # Lint
sudo bun run format       # Format
```

Single-package test:

```bash
cd src/presentation/bot && bun run test
```
