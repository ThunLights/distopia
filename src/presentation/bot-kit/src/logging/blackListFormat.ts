import type { GuildMember } from "discord.js";

import type { LogEmbedField, LogFormat } from "./format";

export const blackListFormat: LogFormat<
  [
    member: GuildMember,
    matches: { description: string; tags: string[]; banned: boolean }[],
    banned: boolean,
  ]
> = {
  title: "ブラックリスト: 該当ユーザーが参加しました",
  color: "Red",
  build: (member, matches, banned) => {
    const maxFields = 24;
    const maxChars = 5000;

    const fields: LogEmbedField[] = [];
    let usedChars = 0;

    for (const [index, match] of matches.entries()) {
      if (fields.length >= maxFields) {
        break;
      }

      const name = `該当ブラックリスト ${index + 1}${match.banned ? " (BAN対象)" : ""}`;
      const value = [match.description, match.tags.length ? `タグ: ${match.tags.join(", ")}` : null]
        .filter(Boolean)
        .join("\n");

      if (usedChars + name.length + value.length > maxChars) {
        break;
      }

      fields.push({ name, value });
      usedChars += name.length + value.length;
    }

    if (fields.length < matches.length) {
      fields.push({
        name: "省略",
        value: `他 ${matches.length - fields.length} 件のブラックリストへの該当は表示上限のため省略されました。`,
      });
    }

    return {
      description: [
        `ユーザー: <@${member.id}> (${member.id})`,
        `実行した処理: ${banned ? "BAN" : "ログのみ"}`,
      ].join("\n"),
      fields,
    };
  },
};
