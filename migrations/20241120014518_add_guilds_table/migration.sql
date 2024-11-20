-- CreateTable
CREATE TABLE "Guild" (
    "guildId" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "banner" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "GuildReview" (
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "star" INTEGER NOT NULL,
    "content" TEXT,

    PRIMARY KEY ("userId", "guildId")
);

-- CreateTable
CREATE TABLE "GuildTag" (
    "guildId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    PRIMARY KEY ("guildId", "tag")
);

-- CreateTable
CREATE TABLE "GuildLevel" (
    "guildId" TEXT NOT NULL PRIMARY KEY,
    "level" BIGINT NOT NULL,
    "point" BIGINT NOT NULL
);
