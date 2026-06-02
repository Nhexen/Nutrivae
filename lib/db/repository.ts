import type { Ingredient } from "@/data/types";
import { getDb } from "./client";

// Repository : seule porte d'accès aux substances pour l'application.
// Interface asynchrone volontaire — implémentation SQLite aujourd'hui,
// Postgres demain, sans changement côté pages.

type Row = Record<string, string>;

function rowToIngredient(r: Row): Ingredient {
  return {
    slug: r.slug,
    name: r.name,
    family: r.family,
    status: r.status,
    summary: r.summary,
    plain: r.plain,
    form: r.form as Ingredient["form"],
    formLabel: r.form_label,
    regulatoryStatus: r.regulatory_status as Ingredient["regulatoryStatus"],
    controversy: r.controversy as Ingredient["controversy"],
    aliases: JSON.parse(r.aliases),
    domains: JSON.parse(r.domains),
    tags: JSON.parse(r.tags),
    foundIn: JSON.parse(r.found_in),
    contraindications: JSON.parse(r.contraindications),
    definition: JSON.parse(r.definition),
    ...(r.definition_source ? { definitionSource: r.definition_source as Ingredient["definitionSource"] } : {}),
    role: JSON.parse(r.role),
    regulation: JSON.parse(r.regulation),
    compatibility: JSON.parse(r.compatibility),
    science: JSON.parse(r.science),
    refs: JSON.parse(r.refs),
    related: JSON.parse(r.related),
  };
}

export async function allIngredients(): Promise<Ingredient[]> {
  const rows = getDb().prepare("SELECT * FROM ingredients ORDER BY name COLLATE NOCASE").all() as Row[];
  return rows.map(rowToIngredient);
}

export async function ingredientBySlug(slug: string): Promise<Ingredient | undefined> {
  const row = getDb().prepare("SELECT * FROM ingredients WHERE slug = ?").get(slug) as Row | undefined;
  return row ? rowToIngredient(row) : undefined;
}

export async function allSlugs(): Promise<string[]> {
  const rows = getDb().prepare("SELECT slug FROM ingredients").all() as Array<{ slug: string }>;
  return rows.map((r) => r.slug);
}
