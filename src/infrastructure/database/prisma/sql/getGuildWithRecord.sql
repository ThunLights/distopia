SELECT *
FROM "Guild" AS g
    INNER JOIN "GuildRecord" AS record
    ON g."guildId" = record."guildId"
WHERE g."guildId" = $1
