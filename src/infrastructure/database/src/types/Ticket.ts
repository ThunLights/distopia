export type Ticket = {
  channelId: string;
  guildId: string;
  userId: string;
  claimedBy: string | null;
  createdAt: Date;
};

export type TicketCreateInput = Omit<Ticket, "claimedBy" | "createdAt">;
