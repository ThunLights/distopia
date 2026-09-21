SELECT *
FROM "GuildRecord" as gr
    INNER JOIN "Guild" as g
    ON gr."guildId" = g."guildId" AND g."public" IS TRUE
WHERE gr."activeRate" IS NOT NULL
ORDER BY gr."activeRate" DESC;
