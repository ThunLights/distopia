-- CreateEnum
CREATE TYPE "WhiteListIdType" AS ENUM ('ChannelId', 'RoleId', 'UserId');

-- CreateEnum
CREATE TYPE "WhiteListPermission" AS ENUM ('InviteLinkBlock');

-- CreateTable
CREATE TABLE "GuildWhiteList" (
    "guildId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "idType" "WhiteListIdType" NOT NULL,
    "allPermissions" BOOLEAN NOT NULL DEFAULT false,
    "permissions" "WhiteListPermission"[] DEFAULT ARRAY[]::"WhiteListPermission"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildWhiteList_pkey" PRIMARY KEY ("guildId","targetId")
);
