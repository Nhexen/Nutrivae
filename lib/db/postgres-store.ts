import type { Ingredient } from "@/data/types";
import { CATALOGUE, COLUMNS, rowToIngredient, rowValues } from "./catalogue";
import { SCHEMA } from "./schema";
import type { Store } from "./store";

// Connexion Postgres unifiée :
//  - DATABASE_URL défini  → vrai Postgres (postgres.js) — prod (Neon, Supabase…).
//  - sinon                → PGlite (Postgres embarqué WASM) — local/test, sans serveur.
interface PgConn {
  query(sql: string, params?: unknown[]): Promise<Record<string, unknown>[]>;
  exec(sql: string): Promise<void>;
}

async function pgliteConn(): Promise<PgConn> {
  const { PGlite } = await import("@electric-sql/pglite");
  const db = await PGlite.create();
  return {
    async query(sql, params = []) {
      return (await db.query(sql, params)).rows as Record<string, unknown>[];
    },
    async exec(sql) {
      await db.exec(sql);
    },
  };
}

async function postgresConn(url: string): Promise<PgConn> {
  const postgres = (await import("postgres")).default;
  const sql = postgres(url);
  return {
    async query(q, params = []) {
      return (await sql.unsafe(q, params as never[])) as unknown as Record<string, unknown>[];
    },
    async exec(q) {
      await sql.unsafe(q);
    },
  };
}

export async function createPostgresStore(): Promise<Store> {
  const url = process.env.DATABASE_URL;
  const conn = url ? await postgresConn(url) : await pgliteConn();

  await conn.exec(SCHEMA);
  const cnt = await conn.query("SELECT count(*)::int AS n FROM ingredients");
  if (Number(cnt[0]?.n ?? 0) === 0) {
    const cols = COLUMNS.join(", ");
    const ph = COLUMNS.map((_, i) => `$${i + 1}`).join(", ");
    const insert = `INSERT INTO ingredients (${cols}) VALUES (${ph}) ON CONFLICT (slug) DO NOTHING`;
    for (const ing of CATALOGUE) await conn.query(insert, rowValues(ing));
  }

  return {
    async all() {
      return (await conn.query("SELECT * FROM ingredients ORDER BY lower(name)")).map(rowToIngredient);
    },
    async bySlug(slug: string): Promise<Ingredient | undefined> {
      const r = await conn.query("SELECT * FROM ingredients WHERE slug = $1", [slug]);
      return r[0] ? rowToIngredient(r[0]) : undefined;
    },
    async slugs() {
      return (await conn.query("SELECT slug FROM ingredients")).map((r) => String(r.slug));
    },
  };
}
