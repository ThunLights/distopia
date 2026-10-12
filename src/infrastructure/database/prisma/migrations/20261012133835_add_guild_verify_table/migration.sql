-- CreateTable
CREATE TABLE "GuildVerify" (
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "channelId" TEXT,
    "roleId" TEXT,
    "pendingRoleId" TEXT,

    CONSTRAINT "GuildVerify_pkey" PRIMARY KEY ("guildId")
);
