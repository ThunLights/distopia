import { ArchiveLevelTables } from "./Level/index";
import { ArchiveActiveRateTables } from "./ActiveRate/index";

export class DatabaseArchiveTables {
	public readonly level = new ArchiveLevelTables();
	public readonly activeRate = new ArchiveActiveRateTables();
}
