
export function compressTxt(content: string, compress: number): string {
	if (content.length < compress) {
		return content
	}
	return content.substring(0, compress) + "...(省略)"
}
