import { createClient, type Client, type InValue } from "@libsql/client";
import fs from "fs";
import path from "path";
import { SCHEMA } from "./schema";

const g = globalThis as any;

function client(): Client {
  if (!g.__db) {
    const url = process.env.DATABASE_URL || "file:./data/store.db";
    if (url.startsWith("file:")) fs.mkdirSync(path.dirname(url.slice(5)), { recursive: true });
    g.__db = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });
  }
  return g.__db;
}

async function init() {
  if (!g.__dbReady) {
    g.__dbReady = (async () => {
      const c = client();
      await c.executeMultiple(SCHEMA);
      // add columns introduced after first release (keeps older databases working)
      const MIGRATIONS: [string, string, string][] = [
        ["customers", "password_hash", "text default ''"], ["customers", "address", "text default ''"], ["customers", "city", "text default ''"],
        ["customers", "state", "text default ''"], ["customers", "pincode", "text default ''"], ["orders", "delivered_at", "text"], ["orders", "bulk_discount", "real default 0"], ["orders", "bulk_label", "text default ''"],
      ];
      for (const [t, col, def] of MIGRATIONS) {
        const have = (await c.execute(`pragma table_info(${t})`)).rows.map((r: any) => r.name);
        if (!have.includes(col)) await c.execute(`alter table ${t} add column ${col} ${def}`);
      }
      const r = await c.execute("select count(*) as n from admins");
      if (Number(r.rows[0].n) === 0) {
        const { seed } = await import("./seed");
        await seed(c);
      }
    })();
  }
  return g.__dbReady;
}

const plain = (row: any) => {
  const o: any = {};
  for (const k of Object.keys(row)) o[k] = typeof row[k] === "bigint" ? Number(row[k]) : row[k];
  return o;
};

export async function all<T = any>(sql: string, args: InValue[] = []): Promise<T[]> {
  await init();
  const r = await client().execute({ sql, args });
  return r.rows.map(plain) as T[];
}
export async function one<T = any>(sql: string, args: InValue[] = []): Promise<T | null> {
  return (await all<T>(sql, args))[0] ?? null;
}
export async function run(sql: string, args: InValue[] = []) {
  await init();
  const r = await client().execute({ sql, args });
  return { id: Number(r.lastInsertRowid ?? 0), changes: r.rowsAffected };
}
export async function batch(stmts: { sql: string; args?: InValue[] }[]) {
  await init();
  return client().batch(
    stmts.map((s) => ({ sql: s.sql, args: s.args ?? [] })),
    "write"
  );
}
export async function rawClient() {
  await init();
  return client();
}
