---
description: Scaffold a new Discord modal submit handler
---

Scaffold a new Discord modal handler. The modal customId and purpose are: $ARGUMENTS

## Steps

1. **Create the modal file** at `src/presentation/bot/src/EventHandler/InteractionCreateHandler/Modal/<ModalName>Modal.ts`

   Follow this pattern (see `BumpNoticeContentModal.ts` for a Zod-validated example):

   ```typescript
   import {
     InteractionResponse,
     MessageFlags,
     type CacheType,
     type InteractionReplyOptions,
     type ModalSubmitInteraction,
     type PermissionResolvable,
   } from "discord.js";
   import z from "zod";
   import { validator, type ValidateResult } from "../../../utils/validator";
   import { GuildParseError } from "../Base/Error/GuildParseError";
   import { ModalSubmitInteractionBase } from "../Base/ModalSubmitInteractionBase";

   const OptionsSchema = z.object({
     fieldValue: z.string(),
   });

   type Options = z.infer<typeof OptionsSchema>;

   export class <ModalName>Modal extends ModalSubmitInteractionBase<Options> {
     // Remove this line if no permission check is needed
     public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
     public override customId: string = "<customId>";

     public override async parseOptions(
       interaction: ModalSubmitInteraction<CacheType>,
     ): Promise<ValidateResult<Options>> {
       return await validator(
         { fieldValue: interaction.fields.getTextInputValue("fieldId") },
         OptionsSchema,
       );
     }

     protected override async exec(
       interaction: ModalSubmitInteraction<CacheType>,
       options: Options,
     ): Promise<InteractionReplyOptions | InteractionResponse> {
       const guild = await this.parseGuild(interaction);
       if (guild instanceof GuildParseError) {
         return { content: guild.message, flags: [MessageFlags.Ephemeral] };
       }

       // implement logic here

       if (interaction.isFromMessage()) {
         return await interaction.update({ content: "Done.", components: [] });
       }
       return { content: "Done.", flags: [MessageFlags.Ephemeral] };
     }
   }
   ```

2. **Rebuild the bot package** to regenerate `Modals.auto.ts` (do NOT edit it manually):

   ```bash
   cd docker && docker compose exec app sudo bun run build
   ```

3. **Run type check** to confirm no errors:

   ```bash
   cd docker && docker compose exec app sudo bun run typecheck
   ```

## Notes

- `customId` must be unique across all modal handlers
- Use `interaction.fields.getTextInputValue("<fieldCustomId>")` to read text inputs
- `interaction.isFromMessage()` returns `true` when the modal was triggered from a message component — use `interaction.update()` in that case
