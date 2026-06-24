---
description: Scaffold a new Discord slash command handler
---

Scaffold a new Discord slash command. The command name and description are: $ARGUMENTS

## Steps

1. **Create the command file** at `src/presentation/bot/src/EventHandler/InteractionCreateHandler/ChatInputCommand/<CommandName>Command.ts`

   Follow this pattern (see `HelpCommand.ts` for a minimal example, `SettingsCommand.ts` for a complex one with subcommands):

   ```typescript
   import {
     MessageFlags,
     type CacheType,
     type ChatInputCommandInteraction,
     type InteractionReplyOptions,
     type MessagePayload,
     type RESTPostAPIChatInputApplicationCommandsJSONBody,
   } from "discord.js";
   import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";

   type Options = {
     // define parsed options here
   };

   export class <CommandName>Command extends ChatInputCommandBase<Options> {
     public override register: RESTPostAPIChatInputApplicationCommandsJSONBody = {
       name: "<command-name>",
       description: "<description>",
       // options: [...] if needed
     };

     public override async parseOptions(
       interaction: ChatInputCommandInteraction<CacheType>,
     ): Promise<Options> {
       return {
         // extract interaction.options here
       };
     }

     protected override async exec(
       interaction: ChatInputCommandInteraction<CacheType>,
       options: Options,
     ): Promise<string | InteractionReplyOptions | MessagePayload> {
       // implement logic here
       return { content: "...", flags: [MessageFlags.Ephemeral] };
     }
   }
   ```

2. **Rebuild the bot package** to regenerate `ChatInputCommands.auto.ts` (do NOT edit it manually):

   ```bash
   cd docker && docker compose exec app sudo bun run build
   ```

3. **Run type check** to confirm no errors:

   ```bash
   cd docker && docker compose exec app sudo bun run typecheck
   ```

## Notes

- To require guild admin permission, add: `public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];`
- To access core services (DB, guild cache), use `this.core` — it is injected by the base class
- Validate options with Zod using the `validator` utility from `../../../utils/validator`
