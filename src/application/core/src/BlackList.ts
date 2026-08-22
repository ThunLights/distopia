import type {
  BlackListEditor,
  BlackListEditorUpsertInput,
  BlackListPermission,
  BlackListTarget,
  BlackListTargetUpsertInput,
  GuildBlackList,
  GuildBlackListUpsertInput,
  UserBlackList,
} from "infra-database/types";

import { Base } from "./Base";
import { MAX_USER_BLACK_LIST_COUNT } from "./utils/constant";

export class BlackList extends Base {
  public async create(
    ownerId: string,
    label: string,
    tags: string[],
  ): Promise<UserBlackList | null> {
    return await this.state.database.userBlackList.createIfUnderLimit(
      ownerId,
      label,
      tags,
      MAX_USER_BLACK_LIST_COUNT,
    );
  }

  public async canCreate(ownerId: string): Promise<boolean> {
    const owned = await this.findAllByOwner(ownerId);
    return owned.length < MAX_USER_BLACK_LIST_COUNT;
  }

  public async updateTags(id: number, tags: string[]): Promise<UserBlackList> {
    const updated = await this.state.database.userBlackList.updateTags(id, tags);
    const tagSet = new Set(tags);

    const targets = await this.state.database.blackListTarget.findAll(id);
    await Promise.all(
      targets
        .filter((target) => target.tags.some((tag) => !tagSet.has(tag)))
        .map((target) =>
          this.state.database.blackListTarget.upsert({
            blackListId: id,
            userId: target.userId,
            label: target.label,
            description: target.description,
            tags: target.tags.filter((tag) => tagSet.has(tag)),
          }),
        ),
    );

    const applications = await this.state.database.guildBlackList.findAllByBlackListId(id);
    await Promise.all(
      applications
        .filter((application) => application.banTags.some((tag) => !tagSet.has(tag)))
        .map((application) =>
          this.state.database.guildBlackList.upsert({
            guildId: application.guildId,
            blackListId: id,
            banTags: application.banTags.filter((tag) => tagSet.has(tag)),
          }),
        ),
    );

    for (const application of applications) {
      this.state.memory.guildBlackList.delete(application.guildId);
    }

    return updated;
  }

  public async delete(id: number): Promise<UserBlackList> {
    const applications = await this.state.database.guildBlackList.findAllByBlackListId(id);
    const deleted = await this.state.database.userBlackList.delete(id);

    for (const application of applications) {
      this.state.memory.guildBlackList.delete(application.guildId);
    }

    return deleted;
  }

  public async find(id: number): Promise<UserBlackList | null> {
    return await this.state.database.userBlackList.find(id);
  }

  public async findAllByOwner(ownerId: string): Promise<UserBlackList[]> {
    return await this.state.database.userBlackList.findAllByOwner(ownerId);
  }

  public async findAllEditable(userId: string): Promise<UserBlackList[]> {
    const owned = await this.findAllByOwner(userId);
    const editorEntries = await this.state.database.blackListEditor.findAllByUserId(userId);
    const editedLists = (
      await Promise.all(editorEntries.map(({ blackListId }) => this.find(blackListId)))
    ).filter((list) => list !== null);

    const ownedIds = new Set(owned.map(({ id }) => id));
    return [...owned, ...editedLists.filter((list) => !ownedIds.has(list.id))];
  }

  public async isOwner(blackListId: number, userId: string): Promise<boolean> {
    const list = await this.find(blackListId);
    return list?.ownerId === userId;
  }

  public async findEditor(blackListId: number, userId: string): Promise<BlackListEditor | null> {
    return await this.state.database.blackListEditor.find(blackListId, userId);
  }

  public async isOwnerOrEditor(blackListId: number, userId: string): Promise<boolean> {
    if (await this.isOwner(blackListId, userId)) {
      return true;
    }
    return Boolean(await this.findEditor(blackListId, userId));
  }

  public async hasPermission(
    blackListId: number,
    userId: string,
    permission: BlackListPermission,
  ): Promise<boolean> {
    if (await this.isOwner(blackListId, userId)) {
      return true;
    }

    const editor = await this.findEditor(blackListId, userId);
    return Boolean(editor && (editor.allPermissions || editor.permissions.includes(permission)));
  }

  public async listTargets(blackListId: number): Promise<BlackListTarget[]> {
    return await this.state.database.blackListTarget.findAll(blackListId);
  }

  public async findTarget(blackListId: number, userId: string): Promise<BlackListTarget | null> {
    return await this.state.database.blackListTarget.find(blackListId, userId);
  }

  public async upsertTarget(input: BlackListTargetUpsertInput): Promise<BlackListTarget> {
    return await this.state.database.blackListTarget.upsert(input);
  }

  public async deleteTarget(blackListId: number, userId: string): Promise<BlackListTarget> {
    return await this.state.database.blackListTarget.delete(blackListId, userId);
  }

  public async listEditors(blackListId: number): Promise<BlackListEditor[]> {
    return await this.state.database.blackListEditor.findAll(blackListId);
  }

  public async upsertEditor(input: BlackListEditorUpsertInput): Promise<BlackListEditor> {
    return await this.state.database.blackListEditor.upsert(input);
  }

  public async deleteEditor(blackListId: number, userId: string): Promise<BlackListEditor> {
    return await this.state.database.blackListEditor.delete(blackListId, userId);
  }

  public async getApplied(guildId: string): Promise<GuildBlackList[]> {
    const cached = this.state.memory.guildBlackList.get(guildId);
    if (cached) {
      return cached.entries;
    }

    const entries = await this.state.database.guildBlackList.findAll(guildId);
    this.state.memory.guildBlackList.set(guildId, { entries, createdAt: new Date() });
    return entries;
  }

  public async findApplication(
    guildId: string,
    blackListId: number,
  ): Promise<GuildBlackList | null> {
    const applied = await this.getApplied(guildId);
    return applied.find((entry) => entry.blackListId === blackListId) ?? null;
  }

  public async apply(input: GuildBlackListUpsertInput): Promise<GuildBlackList> {
    const entry = await this.state.database.guildBlackList.upsert(input);
    this.state.memory.guildBlackList.delete(input.guildId);
    return entry;
  }

  public async unapply(guildId: string, blackListId: number): Promise<GuildBlackList> {
    const entry = await this.state.database.guildBlackList.delete(guildId, blackListId);
    this.state.memory.guildBlackList.delete(guildId);
    return entry;
  }

  public async matchOnJoin(
    guildId: string,
    userId: string,
  ): Promise<
    {
      blackListId: number;
      description: string;
      tags: string[];
      logChannel: string | null;
      banned: boolean;
    }[]
  > {
    const applied = await this.getApplied(guildId);
    if (!applied.length) {
      return [];
    }

    const targets = await this.state.database.blackListTarget.findAllByUserId(
      applied.map(({ blackListId }) => blackListId),
      userId,
    );
    const applicationByListId = new Map(applied.map((entry) => [entry.blackListId, entry]));

    return targets.map((target) => {
      const application = applicationByListId.get(target.blackListId);
      const banned = Boolean(
        application?.autoBan &&
        application.banTags.length &&
        target.tags.some((tag) => application.banTags.includes(tag)),
      );

      return {
        blackListId: target.blackListId,
        description: target.description,
        tags: target.tags,
        logChannel: application?.logChannel ?? null,
        banned,
      };
    });
  }
}
