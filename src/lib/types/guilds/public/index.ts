
export type Response = {
    content: string | {
        name: string
        icon: string | null
        banner: string | null
        invite: string
        guildId: string
        userId: string
        category: string
        description: string
    }[]
}
