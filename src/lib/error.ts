import fs from "fs"
import path from "path"

import { dayExchanger } from "./day.js"

function errorHandlingAny<T>(error: T) {
	if (error instanceof Error) {
		if (error.stack === undefined) {
			errorLog(error.message)
		} else {
			errorLog(error.stack)
		}
	} else {
		errorLog(String(error))
	}
}

function errorHandling(error: unknown) {
	if (error instanceof Error) {
		if (error.stack === undefined) {
			errorLog(error.message)
		} else {
			errorLog(error.stack)
		}
	} else {
		errorLog(String(error))
	}
}

function errorLog(content: string) {
	const base = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
	let date = new Date(base)
	let now = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${dayExchanger.exchangeAbbreviation(date)}) ${date.getHours()}時${date.getMinutes()}分${date.getSeconds()}.${date.getMilliseconds()}秒`

	fs.appendFileSync(path.join(__dirname, `../../log/${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${(date.getDate()).toString().padStart(2, "0")}.log`), (`\n----------${now}----------\n${content}\n`))
}

export {
	errorHandling,
	errorHandlingAny,
	errorLog,
}
