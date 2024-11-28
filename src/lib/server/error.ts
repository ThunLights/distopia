import fs from "fs"
import path from "path"

import { dayExchanger } from "$lib/server/day"

const logFilesDir = path.join(process.cwd(), "log")

export class ServerError {
	public static readonly codes: Record<string, number> = {}
	constructor(public readonly content: string) {}
}

function errorHandling<T>(error: T) {
	if (error instanceof Error) {
		if (error.stack === undefined) {
			errorLog(error.message)
		} else {
			errorLog(error.stack)
		}
	} else if (error && typeof error === "object") {
		errorLog(JSON.stringify(error, null, "\t"));
	} else {
		errorLog(String(error))
	}
}

function errorLog(content: string) {
	const base = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
	let date = new Date(base)
	let now = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${dayExchanger.exchangeAbbreviation(date)}) ${date.getHours()}時${date.getMinutes()}分${date.getSeconds()}.${date.getMilliseconds()}秒`

	fs.appendFileSync(path.join(logFilesDir, `./${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${(date.getDate()).toString().padStart(2, "0")}.log`), (`\n----------${now}----------\n${content}\n`))
}

export {
	errorHandling,
	errorLog,
}
