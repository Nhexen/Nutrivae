import type { Ingredient } from "@/data/types";
import type { Store } from "./store";

// Sélection du store par variable d'environnement :
//   NUTRIVAE_STORE=postgres → Postgres (PGlite local, ou DATABASE_URL en prod)
//   sinon                    → SQLite (node:sqlite, défaut)
// Les pages ne changent jamais : seule l'implémentation derrière `Store` change.
let storePromise: Promise<Store> | null = null;

function getStore(): Promise<Store> {
  if (!storePromise) {
    storePromise =
      process.env.NUTRIVAE_STORE === "postgres"
        ? import("./postgres-store").then((m) => m.createPostgresStore())
        : import("./sqlite-store").then((m) => m.createSqliteStore());
  }
  return storePromise;
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
