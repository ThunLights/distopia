/**
 * Returned by `safeFetchForDiscord` when the requested URL's hostname is
 * not one of the allowed Discord domains (`discord.com`, `discordapp.com`,
 * `discord.gg`).
 */
export class InvalidDomainError extends Error {}
