
export function codeBlock(content: string, lang?: string) {
    const codeBlockLang = lang ?? "";
    return `\`\`\`${codeBlockLang}\n` + content + "\`\`\`\n";
}
