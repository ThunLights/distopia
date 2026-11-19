import { Base } from "./Base";

const halfSec = 500;
const threeSecs = 3 * 1000;

export class RateLimit extends Base {
  public async saveChatInputCommand(userId: string) {
    const limit = new Date(Date.now() + threeSecs);
    await this.state.memory.ratelimit.chatInputCommand.set(userId, limit);
    return limit;
  }

  public async getChatInputCommand(userId: string) {
    const limit = await this.state.memory.ratelimit.chatInputCommand.get(userId);

    return limit ? limit.getTime() > Date.now() : false;
  }

  public async saveButton(userId: string) {
    const limit = new Date(Date.now() + halfSec);
    await this.state.memory.ratelimit.button.set(userId, limit);
    return limit;
  }

  public async getButton(userId: string) {
    const limit = await this.state.memory.ratelimit.button.get(userId);

    return limit ? limit.getTime() > Date.now() : false;
  }

  // Each verification attempt fans out to Discord, the VPN lookup and Turnstile, and a refusal is
  // posted to the guild's log channel -- one attempt per user per window, atomically.
  public async acquireVerify(userId: string): Promise<boolean> {
    return await this.state.memory.ratelimit.verify.acquire(
      userId,
      new Date(Date.now() + threeSecs),
    );
  }
}
