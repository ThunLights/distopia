import { Base } from "./Base";

const halfSec = 500;
const threeSecs = 3 * 1000;

export class LateLimit extends Base {
  public async saveChatInputCommand(userId: string) {
    const limit = new Date(Date.now() + threeSecs);
    this.state.memory.latelimit.chatInputCommand.set(userId, limit);
    return limit;
  }

  public async getChatInputCommand(userId: string) {
    const limit = this.state.memory.latelimit.chatInputCommand.get(userId);

    return limit ? limit.getTime() > Date.now() : false;
  }

  public async saveButton(userId: string) {
    const limit = new Date(Date.now() + halfSec);
    this.state.memory.latelimit.button.set(userId, limit);
    return limit;
  }

  public async getButton(userId: string) {
    const limit = this.state.memory.latelimit.button.get(userId);

    return limit ? limit.getTime() > Date.now() : false;
  }
}
