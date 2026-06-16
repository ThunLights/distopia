-- AlterTable
ALTER TABLE "GuildSetting" ADD COLUMN     "inviteLinkBlock" BOOLEAN;

-- CreateTable
CREATE TABLE "UrlCache" (
    "url" TEXT NOT NULL,
    "isInviteLink" BOOLEAN,

    CONSTRAINT "UrlCache_pkey" PRIMARY KEY ("url")
);
