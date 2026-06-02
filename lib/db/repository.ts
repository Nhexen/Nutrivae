import type { Ingredient } from "@/data/types";
import type { Store } from "./store";

// Sélection du store par variable d'environnement :
//   NUTRIVAE_STORE=postgres → Postgres (PGlite local, ou DATABASE_URL en prod)
//   sinon                    → SQLite (node:sqlite, défaut)
// Les pages ne changent jamais : seule l'implémentation derrière `Store` change.
let storePromise: Promise<Store> | null = null;

function getStore(): Promise<Store> {
  if (!storePromise) {
    const forced = process.env.NUTRIVAE_STORE;
    if (forced === "postgres") storePromise = import("./postgres-store").then((m) => m.createPostgresStore());
    else if (forced === "sqlite") storePromise = import("./sqlite-store").then((m) => m.createSqliteStore());
    else storePromise = autoStore();
  }
  return storePromise;
}

// Sans variable d'environnement : SQLite si disponible (node:sqlite, Node ≥ 24),
// sinon Postgres embarqué (PGlite) — utile là où node:sqlite est indisponible
// (ex. runtime serverless sur une version de Node plus ancienne).
async function autoStore(): Promise<Store> {
  try {
    const { DatabaseSync } = await import("node:sqlite");
    new DatabaseSync(":memory:").close(); // sonde la disponibilité réelle
    return (await import("./sqlite-store")).createSqliteStore();
  } catch {
    return (await import("./postgres-store")).createPostgresStore();
  }
}

export async function allIngredients(): Promise<Ingredient[]> {
  return (await getStore()).all();
}

export async function ingredientBySlug(slug: string): Promise<Ingredient | undefined> {
  return (await getStore()).bySlug(slug);
}

export async function allSlugs(): Promise<string[]> {
  return (await getStore()).slugs();
}
