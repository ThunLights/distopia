import { errorHandling } from "$lib/server/error";
import { DatabaseClient } from "../index";

import { TicketVote } from "./Ticket.vote";
import { TicketVotePanel } from "./Ticket.votePanel";

export class Ticket {
	private readonly table = DatabaseClient._prisma.ticket;

	public readonly vote = new TicketVote(DatabaseClient._prisma.ticketVote);
	public readonly votePanel = new TicketVotePanel(DatabaseClient._prisma.ticketVotePanel);

	public async update(userId: string, channelId: string) {
		try {
			const element = await this.table.findFirst({ where: { userId } });
			if (element) {
				await this.table.updateMany({
					where: { userId },
					data: { channelId }
				});
			} else {
				await this.table.create({ data: { userId, channelId } });
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async remove(userId: string) {
		try {
			return await this.table.deleteMany({
				where: { userId }
			});
		} catch (error) {
			errorHandling(error);
			return null;
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

	public async fetchChannelId(channelId: string) {
		try {
			return await this.table.findFirst({ where: { channelId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}
}
