import type { StandardSchemaV1 } from "@standard-schema/spec";
import { MessageFlags, type InteractionReplyOptions } from "discord.js";

export type ValidateResult<SchemaOutput> = SchemaOutput | ValidateError;

export class ValidateError {
  constructor(public readonly content: InteractionReplyOptions) {}
}

export async function validator<SchemaInput, SchemaOutput>(
  value: unknown,
  schema: StandardSchemaV1<SchemaInput, SchemaOutput>,
): Promise<ValidateResult<SchemaOutput>> {
  const result = await schema["~standard"].validate(value);

  if (result.issues) {
    return new ValidateError({
      content: result.issues.map(({ message }) => message).join("; "),
      flags: [MessageFlags.Ephemeral],
    });
  }

  return result.value;
}
