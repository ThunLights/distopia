import { database, DatabaseError } from "$lib/server/Database/index";
import { errorHandling } from "$lib/server/error";

import { ChannelType } from "discord.js";

import type { Client, VoiceChannel } from "discord.js";

export type ArchiveContent = {
	guildId: string;
	memberCounts: number[];
	memberAverage: number;
};

export class VoiceClient {
	private channelArchives: Record<string, ArchiveContent> = {};

	constructor(private readonly client: Client) {}

	private async registerChecker(guildId: string): Promise<boolean> {
		const guild = await database.guildTables.guild.id2Data(guildId);
		const result = guild instanceof DatabaseError ? null : guild;
		return Boolean(result);
	}

	private async addArchive(channelId: string, guildId: string, memberCount: number) {
		const data =
			this.channelArchives[channelId] ??
			({ guildId, memberCounts: [], memberAverage: 0 } satisfies ArchiveContent);
		data.memberCounts.push(memberCount);
		const sum = data.memberCounts.reduce((all, element) => all + element);
		data.memberAverage = sum / data.memberCounts.length;
		this.channelArchives[channelId] = data;
	}

	private async deleteArchive(channelId: string) {
		delete this.channelArchives[channelId];
	}

	private async addActiveRate(channel: VoiceChannel) {
		try {
			const members = channel.members.filter(
				(member) => !member.user.bot && !(member.voice.mute || member.voice.deaf)
			);
			if (members.size >= 2) {
				await database.guildTables.vcMemberUpperTwo.update(channel.guildId, 1);
			}
			for (const member of members.values()) {
				await database.guildTables.vcMemberSum.update(channel.guildId, member.user.id);
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async levelUpdate() {
		const channels = this.client.channels.cache.values();
		for (const channel of channels) {
			if (
				channel.type === ChannelType.GuildVoice &&
				(await this.registerChecker(channel.guildId))
			) {
				const memberCount = channel.members.filter(
					(member) => !member.user.bot && !(member.voice.mute || member.voice.deaf)
				).size;
				if (memberCount) {
					await this.addActiveRate(channel);
					await this.addArchive(channel.id, channel.guildId, memberCount);
				} else {
					await this.deleteArchive(channel.id);
				}
			}
		}
		for (const [channelId, content] of Object.entries(this.channelArchives)) {
			if (await this.registerChecker(content.guildId)) {
				await database.guildTables.level.plus(
					content.guildId,
					BigInt(Math.ceil(content.memberAverage * 20))
				);
			} else {
				await this.deleteArchive(channelId);
			}
		}
	}
}
