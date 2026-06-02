import { ingredients } from "@/data/ingredients";
import generatedAdditives from "@/data/additives.generated.json";
import generatedCosmetics from "@/data/cosmetics.generated.json";
import type { Ingredient } from "@/data/types";

// Catalogue complet = additifs + cosmétiques ingérés + entrées curatées.
// Les curatées sont en dernier → elles priment en cas de collision de slug.
export const CATALOGUE: Ingredient[] = [
  ...(generatedAdditives as unknown as Ingredient[]),
  ...(generatedCosmetics as unknown as Ingredient[]),
  ...ingredients,
];

// Colonnes de la table (ordre partagé insertion / lecture).
export const COLUMNS = [
  "slug", "name", "family", "status", "summary", "plain", "form", "form_label",
  "regulatory_status", "controversy", "aliases", "domains", "tags", "found_in",
  "contraindications", "definition", "definition_source", "role", "regulation",
  "compatibility", "science", "refs", "related",
] as const;

// Valeurs d'une ligne dans l'ordre des colonnes (JSON sérialisé en texte).
export function rowValues(i: Ingredient): (string | null)[] {
  return [
    i.slug, i.name, i.family, i.status, i.summary, i.plain, i.form, i.formLabel,
    i.regulatoryStatus, i.controversy,
    JSON.stringify(i.aliases), JSON.stringify(i.domains), JSON.stringify(i.tags),
    JSON.stringify(i.foundIn), JSON.stringify(i.contraindications),
    JSON.stringify(i.definition), i.definitionSource ?? null, JSON.stringify(i.role),
    JSON.stringify(i.regulation), JSON.stringify(i.compatibility),
    JSON.stringify(i.science), JSON.stringify(i.refs), JSON.stringify(i.related ?? []),
  ];
}

// Tolère le texte (SQLite) comme le jsonb déjà désérialisé (Postgres).
function j<T>(v: unknown): T {
  return typeof v === "string" ? (JSON.parse(v) as T) : (v as T);
}

export function rowToIngredient(r: Record<string, unknown>): Ingredient {
  return {
    slug: String(r.slug),
    name: String(r.name),
    family: String(r.family),
    status: String(r.status),
    summary: String(r.summary),
    plain: String(r.plain),
    form: r.form as Ingredient["form"],
    formLabel: String(r.form_label),
    regulatoryStatus: r.regulatory_status as Ingredient["regulatoryStatus"],
    controversy: r.controversy as Ingredient["controversy"],
    aliases: j(r.aliases),
    domains: j(r.domains),
    tags: j(r.tags),
    foundIn: j(r.found_in),
    contraindications: j(r.contraindications),
    definition: j(r.definition),
    ...(r.definition_source ? { definitionSource: r.definition_source as Ingredient["definitionSource"] } : {}),
    role: j(r.role),
    regulation: j(r.regulation),
    compatibility: j(r.compatibility),
    science: j(r.science),
    refs: j(r.refs),
    related: j(r.related),
  };
}
