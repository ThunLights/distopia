import { Prisma } from "../prisma-client/client";

type Row = Record<string, unknown>;

// Stays far below Postgres' 65535 bind-parameter limit for the widest tables here.
const ROWS_PER_STATEMENT = 1000;

type BulkUpsertOptions<T extends Row> = {
  table: string;
  keys: readonly (keyof T & string)[];
  // Allowlist: column names are spliced into SQL, so only these may appear in a row.
  columns: readonly (keyof T & string)[];
  rows: readonly T[];
  // SET expression for a non-key column on conflict (default: take the new value).
  onConflict?: (column: string) => Prisma.Sql;
  // On conflict, rows where this is false are left untouched.
  updateWhere?: Prisma.Sql;
  // Folds two rows with the same key (default: later fields win, like sequential upserts).
  merge?: (a: T, b: T) => T;
};

const quote = (name: string) => Prisma.raw(`"${name}"`);

/**
 * Builds multi-row `INSERT ... ON CONFLICT DO UPDATE` statements replacing one Prisma upsert per
 * row. Rows are merged per key (one statement can't touch a row twice) and sorted by key so
 * overlapping batches take row locks in the same order, avoiding Postgres deadlocks (40P01).
 * `undefined` fields stay untouched, as with Prisma's upsert.
 *
 * @returns One statement per run of key-sorted rows that set the same columns (at most 1000 rows
 * each); execute them in order inside one transaction.
 * @throws {Error} When a row sets a column not listed in `columns`.
 *
 * @example
 * await prisma.$transaction(
 *   buildBulkUpserts({ table: "User", keys: ["userId"], columns: ["userId", "level"], rows })
 *     .map((sql) => prisma.$executeRaw(sql)),
 * );
 */
export function buildBulkUpserts<T extends Row>({
  table,
  keys,
  columns,
  rows,
  onConflict = (column) => Prisma.sql`EXCLUDED.${quote(column)}`,
  updateWhere,
  merge = (a, b) => ({ ...a, ...b }),
}: BulkUpsertOptions<T>): Prisma.Sql[] {
  const keyOf = (row: T) => JSON.stringify(keys.map((key) => toParam(row[key])));
  const merged = new Map<string, T>();
  for (const row of rows) {
    const defined = Object.fromEntries(
      Object.entries(row).filter(([, value]) => value !== undefined),
    ) as T;
    const key = keyOf(defined);
    const previous = merged.get(key);
    merged.set(key, previous ? merge(previous, defined) : defined);
  }

  // Consecutive runs of the key-sorted rows that set the same columns: one statement per run,
  // so locks are still taken in global key order across statements.
  const runs: { columns: string[]; rows: T[] }[] = [];
  for (const [, row] of [...merged].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    const rowColumns = Object.keys(row).sort();
    for (const column of rowColumns) {
      if (!(columns as readonly string[]).includes(column)) {
        throw new Error(`Unknown column "${column}" for bulk upsert into "${table}"`);
      }
    }
    const last = runs.at(-1);
    if (
      last &&
      last.rows.length < ROWS_PER_STATEMENT &&
      last.columns.join(",") === rowColumns.join(",")
    ) {
      last.rows.push(row);
    } else {
      runs.push({ columns: rowColumns, rows: [row] });
    }
  }

  return runs.map(({ columns: runColumns, rows: runRows }) => {
    const updates = runColumns
      .filter((column) => !(keys as readonly string[]).includes(column))
      .map((column) => Prisma.sql`${quote(column)} = ${onConflict(column)}`);
    const conflict = updates.length
      ? Prisma.sql`DO UPDATE SET ${Prisma.join(updates)}${updateWhere ? Prisma.sql` WHERE ${updateWhere}` : Prisma.empty}`
      : Prisma.sql`DO NOTHING`;
    const values = runRows.map(
      (row) => Prisma.sql`(${Prisma.join(runColumns.map((column) => toParam(row[column])))})`,
    );
    return Prisma.sql`
      INSERT INTO ${quote(table)} (${Prisma.join(runColumns.map(quote))})
      VALUES ${Prisma.join(values)}
      ON CONFLICT (${Prisma.join(keys.map(quote))}) ${conflict}
    `;
  });
}

// `@db.Date` columns: send the UTC calendar date, as Prisma's own upsert does, so the stored day
// doesn't depend on the server's or session's time zone.
function toParam(value: unknown) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value;
}
