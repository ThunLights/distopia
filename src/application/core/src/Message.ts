import { findUrls, levelUp } from "domain-service";
import type { GuildRecordOneDayUpsertInput } from "infra-database/types";
import { isInviteLink } from "infra-http";

import { Base } from "./Base";
import { formatYMD } from "./utils/date";

export class Message extends Base {
  public async increase(guildId: string, memberId: string, messageContent: string) {
    const latelimit = this.state.memory.latelimit.messageCreate;
    const limit = latelimit.get(memberId);

    if (limit && limit.getTime() > Date.now()) {
      return;
    }

    if (!messageContent.length) {
      return;
    }

    const minute = 60 * 1000;

    latelimit.set(memberId, new Date(Date.now() + minute));

    const data = this.state.memory.messageCreate.get(guildId);

    this.state.memory.messageCreate.set(guildId, {
      messageLens: [...(data?.messageLens ?? []), messageContent.length],
      updatedAt: new Date(),
    });
  }

  public async syncDB() {
    const date = await formatYMD(new Date());
    const query: GuildRecordOneDayUpsertInput[] = [];
    const guilds = new Map(
      (await this.state.database.guildRecord.findAll()).map((value) => [value.guildId, value]),
    );
    const records = new Map(
      (await this.state.database.guildRecordOneDay.findFixedTimesAll(date)).map((value) => [
        value.guildId,
        value,
      ]),
    );

    for (const [guildId, value] of this.state.memory.messageCreate.entries()) {
      const guild = guilds.get(guildId);
      const record = records.get(guildId);
      let level = guild?.level ?? 0n,
        point = guild?.point ?? 0n;

      for (const messageLen of value.messageLens) {
        const score = await levelUp(level, point, BigInt(Math.ceil(Math.sqrt(messageLen))));
        level = score.level;
        point = score.point;
      }

      query.push({
        guildId,
        date,
        newMessages: (record?.newMessages ?? 0) + value.messageLens.length,
      });
    }

    this.state.memory.messageCreate.clear();

    await this.state.database.guildRecordOneDay.upsertAll(query);
  }

  public async includeInviteLink(content: string) {
    const { inviteLinks, normalUrls } = await findUrls(content);

    for (const url of normalUrls) {
      const memoryCache = this.state.memory.urlCacheInMemory.get(url)?.isInviteLink;
      if (memoryCache !== undefined) {
        if (memoryCache) {
          inviteLinks.push(url);
        }
        continue;
      }

      const response = await isInviteLink(url);

      if (response instanceof Error) {
        continue;
      }

      if (!response.isUsedCf) {
        this.state.memory.urlCacheInMemory.set(url, {
          isInviteLink: response.content,
          createdAt: new Date(),
        });
        if (response.content) {
          inviteLinks.push(url);
        }
      }
    }

    return inviteLinks;
  }
}
