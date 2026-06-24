---
description: Scaffold a new Discord button interaction handler
---

Scaffold a new Discord button handler. The button customId and purpose are: $ARGUMENTS

## Steps

1. **Create the button file** at `src/presentation/bot/src/EventHandler/InteractionCreateHandler/Button/<ButtonName>Button.ts`

   Follow this pattern (see `BumpNoticeOnButton.ts` for a typical example):

   ```typescript
   import {
     InteractionResponse,
     MessageFlags,
     type ButtonInteraction,
     type CacheType,
     type InteractionReplyOptions,
     type MessagePayload,
     type PermissionResolvable,
   } from "discord.js";
   import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
   import { GuildParseError } from "../Base/Error/GuildParseError";

   export class <ButtonName>Button extends ButtonInteractionBase {
     // Remove this line if no permission check is needed
     public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
     public override customId: string = "<customId>";

     protected override async exec(
       interaction: ButtonInteraction<CacheType>,
     ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
       const guild = await this.parseGuild(interaction);
       if (guild instanceof GuildParseError) {
         return { content: guild.message, flags: [MessageFlags.Ephemeral] };
       }

       // implement logic here

       return { content: "Done.", flags: [MessageFlags.Ephemeral] };
     }
   }
   ```

2. **Rebuild the bot package** to regenerate `Buttons.auto.ts` (do NOT edit it manually):

   ```bash
   cd docker && docker compose exec app sudo bun run build
   ```

3. **Run type check** to confirm no errors:

   ```bash
   cd docker && docker compose exec app sudo bun run typecheck
   ```

## Notes

- `customId` must be unique across all button handlers
- Use `interaction.update({...})` to update the original message in-place instead of replying
- To add a companion `Component` export (for use as a factory in page builders), create a matching file under `src/presentation/bot/src/EventHandler/InteractionCreateHandler/Component/Button/`
