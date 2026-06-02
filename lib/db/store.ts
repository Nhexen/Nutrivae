import type { Ingredient } from "@/data/types";

// Contrat commun à tous les stores (SQLite, Postgres…).
// C'est le point de bascule : les pages ne dépendent que de cette interface.
export interface Store {
  all(): Promise<Ingredient[]>;
  bySlug(slug: string): Promise<Ingredient | undefined>;
  slugs(): Promise<string[]>;
}
