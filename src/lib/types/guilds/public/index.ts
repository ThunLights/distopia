
export type Response = {
    content: string | {
        name: string
        icon: string | null
        banner: string | null
        guildId: string
        userId: string
        category: string
        description: string
    }[]
}
