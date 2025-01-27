import { errorHandling } from "$lib/server/error";
import { DangerousPeopleTag } from "./DangerousPeople.tag";
import { z } from "zod";
import { DangerousPeopleScore } from "./DangerousPeople.score";
import { SubAccount } from "./DangerousPeople.subAccount";
import { DatabaseClient } from "$lib/server/Database/index";

import type { DangerousPeopleTypeZod } from "$lib/constants";

export type DangerousPeopleType = z.infer<typeof DangerousPeopleTypeZod>;

export type UpdateElement = {
    type: string
    name: string
    title: string
    description: string
    time: Date
}

export type Element = {
    userId: string
} & Required<UpdateElement>

export type FetchOptions = {
	partial?: boolean
}

export type SearchOptions = {
	name?: {
		contains: string
	},
	title?: {
		contains: string
	},
	description?: {
		contains: string
	},
}

export class DangerousPeople {
	public readonly tag = new DangerousPeopleTag(DatabaseClient._prisma.dangerousPeopleTag);
	public readonly score = new DangerousPeopleScore(DatabaseClient._prisma.dangerousPeopleScore);
	public readonly subAccount = new SubAccount(DatabaseClient._prisma.dangerousPeopleSubAccount);

	private readonly table = DatabaseClient._prisma.dangerousPeople;

	public async fetch(userId: string, options?: FetchOptions) {
		try {
			if (options && options.partial) {
				return await this.table.findFirst({ where: { userId: { contains: userId } } });
			}
			return await this.table.findFirst({ where: { userId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}

	public async search(content: string) {
		try {
			const whereContent = { contains: content };
			return await this.table.findMany({
				where: {
					OR: [
						{ name: whereContent },
						{ title: whereContent },
						{ description: whereContent },
					],
				}
			});
		} catch (error) {
			errorHandling(error);
			return []
		}
	}

	public async update(userId: string, target: UpdateElement) {
		try {
			const element = await this.table.findFirst({ where: { userId } });
			if (element) {
				await this.table.updateMany({
					where: { userId },
					data: target,
				})
			} else {
				await this.table.create({
					data: {
						...target,
						...{ userId },
					}
				})
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async delete(userId: string) {
		try {
			await this.table.deleteMany({ where: { userId } })
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async countAll() {
		try {
			return (await this.table.findMany()).length;
		} catch (error) {
			errorHandling(error);
			return 0;
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
