import type { MapWithGC } from "repo-memory/MapWithGC";

import { Base } from "./Base";

export class Memory extends Base {
  public async gcForShortInterval() {
    const mems: MapWithGC<any, any>[] = [this.state.memory.oauth2Guilds];

    for (const mem of mems) {
      mem.gc();
    }
  }

  public async gc() {
    const mems: MapWithGC<any, any>[] = [
      this.state.memory.guildEdit,
      this.state.memory.guildMemberAdd,
      this.state.memory.messageCreate,
      this.state.memory.oauth2PKCE,
      this.state.memory.urlCacheInMemory,
      this.state.memory.userOAuth2,
      this.state.memory.voiceChannelMember,
      this.state.memory.latelimit.button,
      this.state.memory.latelimit.bump,
      this.state.memory.latelimit.chatInputCommand,
      this.state.memory.latelimit.messageCreate,
    ];

    for (const mem of mems) {
      mem.gc();
    }
  }
}
