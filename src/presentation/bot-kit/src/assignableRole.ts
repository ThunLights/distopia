import type { Role } from "discord.js";

// Returns why `role` can't be handed out by a feature configured by `invokerId` (role panel,
// verify), or null if it can. Without the position check, an Administrator who isn't the owner
// could pick a role above their own highest one and then grant it to an alt through the feature.
export async function checkAssignableRole(role: Role, invokerId: string): Promise<string | null> {
  if (role.managed || role.id === role.guild.id) {
    return "この役職は設定できません。";
  }
  if (!role.editable) {
    return "ボットの役職より上位の役職は設定できません。";
  }
  const member = await role.guild.members.fetch(invokerId);
  if (role.guild.ownerId !== member.id && role.comparePositionTo(member.roles.highest) >= 0) {
    return "あなたの最上位の役職以上の役職は設定できません。";
  }
  return null;
}
