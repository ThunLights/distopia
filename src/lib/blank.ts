
export function blank(content: string): boolean {
    content = content.replaceAll("\n", "")
    content = content.replaceAll(/\s+/g, "")

    return content === ""
}
