import { DatabaseSync } from "node:sqlite";
import { ingredients } from "@/data/ingredients";
import type { Ingredient } from "@/data/types";
import { SCHEMA } from "./schema";

// Accès bas niveau à la base SQLite (moteur natif node:sqlite, Node ≥ 22).
//
// V1.1 : stockage en mémoire, ensemencé depuis le dataset de référence
// (data/ingredients.ts). Le but est de faire passer tout l'accès aux données
// par une couche SQL + repository asynchrone — le point de bascule vers une
// base persistante (Postgres) en V2, sans toucher aux pages.
//
// Pour un fichier persistant : définir NUTRIVAE_DB=db/nutrivae.db
// (à réserver à un process unique — éviter en build multi-worker).

let db: DatabaseSync | null = null;

const COLUMNS = [
  "slug", "name", "family", "status", "summary", "plain", "form", "form_label",
  "regulatory_status", "controversy", "aliases", "domains", "tags", "found_in",
  "contraindications", "definition", "role", "regulation", "compatibility",
  "science", "refs", "related",
] as const;

function rowValues(i: Ingredient): string[] {
  return [
    i.slug, i.name, i.family, i.status, i.summary, i.plain, i.form, i.formLabel,
    i.regulatoryStatus, i.controversy,
    JSON.stringify(i.aliases), JSON.stringify(i.domains), JSON.stringify(i.tags),
    JSON.stringify(i.foundIn), JSON.stringify(i.contraindications),
    JSON.stringify(i.definition), JSON.stringify(i.role),
    JSON.stringify(i.regulation), JSON.stringify(i.compatibility),
    JSON.stringify(i.science), JSON.stringify(i.refs), JSON.stringify(i.related ?? []),
  ];
}

function seed(database: DatabaseSync) {
  const placeholders = COLUMNS.map(() => "?").join(", ");
  const stmt = database.prepare(
    `INSERT OR REPLACE INTO ingredients (${COLUMNS.join(", ")}) VALUES (${placeholders})`,
  );
  database.exec("BEGIN");
  try {
    for (const ing of ingredients) stmt.run(...rowValues(ing));
    database.exec("COMMIT");
  } catch (err) {
    database.exec("ROLLBACK");
    throw err;
  }
}

export function getDb(): DatabaseSync {
  if (db) return db;
  const location = process.env.NUTRIVAE_DB ?? ":memory:";
  const database = new DatabaseSync(location);
  database.exec(SCHEMA);
  const { n } = database.prepare("SELECT count(*) AS n FROM ingredients").get() as { n: number };
  if (n === 0) seed(database);
  db = database;
  return db;
}
