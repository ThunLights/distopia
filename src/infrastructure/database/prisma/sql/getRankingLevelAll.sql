SELECT *
FROM "GuildRecord" as gr
    INNER JOIN "Guild" as g
    ON gr."guildId" = g."guildId" AND g."public" IS TRUE
ORDER BY gr."level" DESC;
