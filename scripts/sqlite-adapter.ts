import { DatabaseSync } from 'node:sqlite';
import type { D1Database } from '@cloudflare/workers-types';
import { readFileSync } from 'node:fs';
export function createLocalDatabase(path = ':memory:') {
  const sqlite = new DatabaseSync(path);
  sqlite.exec(readFileSync(new URL('../migrations/0001_enquiries.sql', import.meta.url), 'utf8'));
  const prepare = (query: string) => {
    let values: unknown[] = [];
    const statement = {
      bind(...args: unknown[]) {
        values = args;
        return statement;
      },
      async first<T>() {
        return (sqlite.prepare(query).get(...(values as (string | number | null)[])) ||
          null) as T | null;
      },
      async all<T>() {
        return {
          success: true,
          results: sqlite.prepare(query).all(...(values as (string | number | null)[])) as T[],
        };
      },
      async run() {
        const result = sqlite.prepare(query).run(...(values as (string | number | null)[]));
        return { success: true, meta: { changes: result.changes } };
      },
    };
    return statement;
  };
  return { db: { prepare } as unknown as D1Database, close: () => sqlite.close(), sqlite };
}
