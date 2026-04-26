SELECT *
FROM "GuildRecord" as gr
    INNER JOIN "Guild" as g
    ON gr."guildId" = g."guildId"
ORDER BY gr."activeRate" DESC
LIMIT $1;
