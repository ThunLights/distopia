-- AlterTable
ALTER TABLE "GuildSetting" ADD COLUMN     "inviteLinkBlock" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UrlCache" (
    "url" TEXT NOT NULL,
    "isInviteLink" BOOLEAN,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UrlCache_pkey" PRIMARY KEY ("url")
);
