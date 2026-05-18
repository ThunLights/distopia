import { parseErrRes } from "$lib/client/error";
import { Toast } from "$lib/client/toast";
import type { PostBody } from "$lib/shared/types/routes/api/guild/join";

export async function joinGuildUseOauth2(guildId: string, guildName: string) {
  const response = await fetch("/api/guild/join", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      guildId,
    } satisfies PostBody),
  });

  if (response.status === 201) {
    Toast.success(`「${guildName}」に参加しました。Discordを確認してください`);
  } else if (response.status === 204) {
    Toast.success(`「${guildName}」には既に参加しています。`);
  } else if (response.status === 400) {
    await parseErrRes(response);
  }
}

export async function joinGuild(
  guildId: string,
  guildName: string,
  invite: string,
  useOAuth2: boolean,
) {
  if (useOAuth2) {
    await joinGuildUseOauth2(guildId, guildName);
  } else {
    location.href = `https://discord.gg/${invite}`;
  }
}
