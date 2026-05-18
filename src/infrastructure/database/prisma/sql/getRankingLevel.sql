SELECT *
FROM "GuildRecord" as gr
    INNER JOIN "Guild" as g
    ON gr."guildId" = g."guildId"
ORDER BY gr."level" DESC
LIMIT $1;
