-- AlterTable
ALTER TABLE "GuildSetting" ADD COLUMN     "ticketCategory" TEXT,
ADD COLUMN     "ticketLogChannel" TEXT,
ADD COLUMN     "ticketRole" TEXT;

-- CreateTable
CREATE TABLE "Ticket" (
    "channelId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("channelId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_guildId_userId_key" ON "Ticket"("guildId", "userId");
