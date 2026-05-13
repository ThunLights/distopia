-- CreateEnum
CREATE TYPE "PanelType" AS ENUM ('ActiveRateRanking', 'LevelRanking', 'UserBumpRanking');

-- CreateEnum
CREATE TYPE "JWTAlg" AS ENUM ('HS256');

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "bumpCounter" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserWeb" (
    "userId" TEXT NOT NULL,
    "jwtVerifyKey" TEXT NOT NULL,

    CONSTRAINT "UserWeb_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserDiscord" (
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "email" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDiscord_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Friend" (
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "nsfw" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Guild" (
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "invite" TEXT NOT NULL,
    "icon" TEXT,
    "banner" TEXT,
    "description" TEXT,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nsfw" BOOLEAN NOT NULL DEFAULT false,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "bumpTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "GuildReview" (
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "star" INTEGER NOT NULL,
    "content" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildReview_pkey" PRIMARY KEY ("userId","guildId")
);

-- CreateTable
CREATE TABLE "GuildRecordOneDay" (
    "guildId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "vcMembers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "newMembers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "newMessages" INTEGER NOT NULL DEFAULT 0,
    "vcMemberUpperTwo" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GuildRecordOneDay_pkey" PRIMARY KEY ("guildId","date")
);

-- CreateTable
CREATE TABLE "GuildRecord" (
    "guildId" TEXT NOT NULL,
    "maxlevelRank" BIGINT,
    "maxRateRank" BIGINT,
    "maxRate" BIGINT,
    "bumpCounter" INTEGER NOT NULL DEFAULT 0,
    "activeRate" BIGINT,
    "level" BIGINT NOT NULL DEFAULT 0,
    "point" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "GuildRecord_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "GuildSetting" (
    "guildId" TEXT NOT NULL,
    "actingOwner" TEXT,
    "bumpNotice" BOOLEAN NOT NULL DEFAULT false,
    "bumpNoticeRole" TEXT,
    "bumpNoticeContent" TEXT,

    CONSTRAINT "GuildSetting_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "Panel" (
    "guildId" TEXT NOT NULL,
    "type" "PanelType" NOT NULL,
    "channelId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "Panel_pkey" PRIMARY KEY ("guildId","type")
);

-- CreateTable
CREATE TABLE "JWTKey" (
    "id" SERIAL NOT NULL,
    "key" BYTEA NOT NULL,
    "alg" "JWTAlg" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JWTKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JWTKey_key_key" ON "JWTKey"("key");
