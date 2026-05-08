import type { MapWithGC } from "repo-memory/MapWithGC";

import { Base } from "./Base";

export class Memory extends Base {
  public async gc() {
    const mems: MapWithGC<any, any>[] = [
      this.state.memory.guildEdit,
      this.state.memory.guildMemberAdd,
      this.state.memory.messageCreate,
      this.state.memory.userOAuth2,
      this.state.memory.voiceChannelMember,
      this.state.memory.latelimit.bump,
      this.state.memory.latelimit.messageCreate,
    ];

    for (const mem of mems) {
      mem.gc();
    }
  }
}
