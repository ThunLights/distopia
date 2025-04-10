import fs from "fs/promises";
import path from "path";
import { errorHandling } from "./error";

const dbPath = path.join(process.cwd(), "db", "database.sqlite3");

export async function generateBackUp() {
	try {
		const base = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
		const date = new Date(base);
		const dbContent = await fs.readFile(dbPath);
		const fileName = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}.sqlite3`;
		const newBackupPath = path.join(process.cwd(), "archive", fileName);
		await fs.writeFile(newBackupPath, dbContent);
		return fileName;
	} catch (error) {
		errorHandling(error);
		return null;
	}
}
