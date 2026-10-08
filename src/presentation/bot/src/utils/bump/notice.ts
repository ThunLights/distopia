import type { AppCore } from "app-core";
import type { BumpNoticeJob } from "app-core/Guild";
import { EmbedBuilder, type Client } from "discord.js";

// Process-local, in-memory only -- mirrors presentation-bot's tts/session.ts: the live
// setTimeout can't survive a restart, so Guild.saveBumpNotice's Redis copy is what actually
// does, and restoreBumpNotices re-arms one of these from it on boot.
const timers = new Map<string, NodeJS.Timeout>();

export function scheduleBumpNotice(job: BumpNoticeJob, client: Client, core: AppCore): void {
  const existing = timers.get(job.guildId);
  if (existing) {
    clearTimeout(existing);
  }

  const delay = Math.max(0, new Date(job.fireAt).getTime() - Date.now());
  timers.set(
    job.guildId,
    setTimeout(() => void fireBumpNotice(job, client, core), delay),
  );
}

async function fireBumpNotice(job: BumpNoticeJob, client: Client, core: AppCore): Promise<void> {
  timers.delete(job.guildId);
  await core.guild.clearBumpNotice(job.guildId);

  try {
    const channel = await client.channels.fetch(job.channelId);
    if (!channel?.isSendable()) {
      return;
    }

    const embed = new EmbedBuilder()
      .setColor("Gold")
      .setTitle("Bumpが実行できますよ!!")
      .setURL("https://distopia.top/")
      .setDescription(
        job.content ??
          `只今、前回のBumpから2時間がたちました。\n再度 ${
            job.commandId ? `</bump:${job.commandId}>` : "/bump"
          } を実行可能です。`,
      );

    await channel.send({
      content: job.roleId ? `<@&${job.roleId}>` : undefined,
      embeds: [embed],
    });
  } catch (error) {
    console.error(`[bump] failed to send bump notice for guild ${job.guildId}`, error);
  }
}

// Called once from client.ts's `clientReady` handler to re-arm every bump notice that
// survived a restart -- a rolling update kills the old pod's process (and with it every
// in-memory setTimeout), but the Redis-backed job (see Guild.saveBumpNotice) tells the new pod
// what's still pending, including one already past due, which fires immediately.
export async function restoreBumpNotices(client: Client<true>, core: AppCore): Promise<void> {
  const jobs = await core.guild.getAllBumpNotices();
  for (const job of jobs) {
    scheduleBumpNotice(job, client, core);
  }
}
