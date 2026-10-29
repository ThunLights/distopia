-- CreateTable
CREATE TABLE "GuildLogSetting" (
    "guildId" TEXT NOT NULL,
    "logAntiRaid" TEXT,
    "logMemberJoin" TEXT,
    "logMemberLeave" TEXT,
    "logMemberTimeout" TEXT,
    "logMemberKick" TEXT,
    "logMemberBan" TEXT,
    "logMemberUnban" TEXT,
    "logRoleCreate" TEXT,
    "logRoleEdit" TEXT,
    "logRoleDelete" TEXT,
    "logChannelCreate" TEXT,
    "logChannelEdit" TEXT,
    "logChannelDelete" TEXT,
    "logMessageEdit" TEXT,
    "logMessageDelete" TEXT,
    "logVoiceJoin" TEXT,
    "logVoiceLeave" TEXT,

    CONSTRAINT "GuildLogSetting_pkey" PRIMARY KEY ("guildId")
);

-- Copy existing log channels before dropping their GuildSetting columns
INSERT INTO "GuildLogSetting" ("guildId", "logAntiRaid", "logMemberJoin", "logMemberLeave", "logMemberTimeout", "logMemberKick", "logMemberBan", "logMemberUnban", "logRoleCreate", "logRoleEdit", "logRoleDelete", "logChannelCreate", "logChannelEdit", "logChannelDelete", "logMessageEdit", "logMessageDelete", "logVoiceJoin", "logVoiceLeave")
SELECT "guildId", "logAntiRaid", "logMemberJoin", "logMemberLeave", "logMemberTimeout", "logMemberKick", "logMemberBan", "logMemberUnban", "logRoleCreate", "logRoleEdit", "logRoleDelete", "logChannelCreate", "logChannelEdit", "logChannelDelete", "logMessageEdit", "logMessageDelete", "logVoiceJoin", "logVoiceLeave"
FROM "GuildSetting"
WHERE "logAntiRaid" IS NOT NULL OR "logMemberJoin" IS NOT NULL OR "logMemberLeave" IS NOT NULL OR "logMemberTimeout" IS NOT NULL OR "logMemberKick" IS NOT NULL OR "logMemberBan" IS NOT NULL OR "logMemberUnban" IS NOT NULL OR "logRoleCreate" IS NOT NULL OR "logRoleEdit" IS NOT NULL OR "logRoleDelete" IS NOT NULL OR "logChannelCreate" IS NOT NULL OR "logChannelEdit" IS NOT NULL OR "logChannelDelete" IS NOT NULL OR "logMessageEdit" IS NOT NULL OR "logMessageDelete" IS NOT NULL OR "logVoiceJoin" IS NOT NULL OR "logVoiceLeave" IS NOT NULL;

-- AlterTable
ALTER TABLE "GuildSetting"
DROP COLUMN "logAntiRaid",
DROP COLUMN "logMemberJoin",
DROP COLUMN "logMemberLeave",
DROP COLUMN "logMemberTimeout",
DROP COLUMN "logMemberKick",
DROP COLUMN "logMemberBan",
DROP COLUMN "logMemberUnban",
DROP COLUMN "logRoleCreate",
DROP COLUMN "logRoleEdit",
DROP COLUMN "logRoleDelete",
DROP COLUMN "logChannelCreate",
DROP COLUMN "logChannelEdit",
DROP COLUMN "logChannelDelete",
DROP COLUMN "logMessageEdit",
DROP COLUMN "logMessageDelete",
DROP COLUMN "logVoiceJoin",
DROP COLUMN "logVoiceLeave";
