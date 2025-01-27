import { errorHandling } from "$lib/server/error";
import { DatabaseClient } from "../index";
import { FriendTag } from "./Friend.tag";

export type Element = {
    userId: string
    username: string
    description: string
    nsfw: boolean
    time: Date
}

export class Friend {
	public readonly tag = new FriendTag(DatabaseClient._prisma.friendTag);

	private readonly table = DatabaseClient._prisma.friend;

	public async update(data: Element) {
		try {
			const { userId } = data;
			const element = await this.table.findFirst({ where: { userId } });
			if (element) {
				await this.table.updateMany({
					where: { userId },
					data,
				})
			} else {
				await this.table.create({ data })
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async fetch(userId: string) {
		try {
			return await this.table.findFirst({ where: { userId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}

	public async findMany(skip?: number) {
		try {
			return await this.table.findMany({
				orderBy: {
					time: "desc"
				},
				take: 50,
				skip: skip ?? 0,
			});
		} catch (error) {
			errorHandling(error);
			return [];
		}
	}
}
