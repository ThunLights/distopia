-- AlterTable
ALTER TABLE "GuildVerify" ADD COLUMN     "blockVpn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "logChannelId" TEXT;

-- AlterTable
ALTER TABLE "UserVerifyLog" ADD COLUMN     "email" TEXT,
ADD COLUMN     "isProxy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVpn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vpnProvider" TEXT;
