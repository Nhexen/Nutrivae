import { DatabaseSync } from "node:sqlite";
import type { Ingredient } from "@/data/types";
import { CATALOGUE, COLUMNS, rowToIngredient, rowValues } from "./catalogue";
import { SCHEMA } from "./schema";
import type { Store } from "./store";

// Store SQLite (moteur natif node:sqlite). Défaut. En mémoire, ensemencé depuis
// le catalogue ; fichier persistant possible via NUTRIVAE_DB.
let db: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (db) return db;
  const d = new DatabaseSync(process.env.NUTRIVAE_DB ?? ":memory:");
  d.exec(SCHEMA);
  const { n } = d.prepare("SELECT count(*) AS n FROM ingredients").get() as { n: number };
  if (n === 0) {
    const ph = COLUMNS.map(() => "?").join(", ");
    const stmt = d.prepare(`INSERT OR REPLACE INTO ingredients (${COLUMNS.join(", ")}) VALUES (${ph})`);
    d.exec("BEGIN");
    try {
      for (const i of CATALOGUE) stmt.run(...rowValues(i));
      d.exec("COMMIT");
    } catch (e) {
      d.exec("ROLLBACK");
      throw e;
    }
  }
  db = d;
  return db;
}

export function createSqliteStore(): Store {
  return {
    async all() {
      return (getDb().prepare("SELECT * FROM ingredients ORDER BY name COLLATE NOCASE").all() as Record<string, unknown>[]).map(rowToIngredient);
    },
    async bySlug(slug: string): Promise<Ingredient | undefined> {
      const r = getDb().prepare("SELECT * FROM ingredients WHERE slug = ?").get(slug) as Record<string, unknown> | undefined;
      return r ? rowToIngredient(r) : undefined;
    },
    async slugs() {
      return (getDb().prepare("SELECT slug FROM ingredients").all() as Array<{ slug: string }>).map((r) => r.slug);
    },
  };
}
