import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class TicketVotePanel {
	constructor(private readonly table: Prisma.TicketVotePanelDelegate<DefaultArgs>) {}
}
