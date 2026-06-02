import type { Ingredient } from "@/data/types";
import { allIngredients, allSlugs, ingredientBySlug } from "@/lib/db/repository";

// Façade applicative au-dessus du repository. Asynchrone : l'accès aux données
// passe désormais par une couche SQL, prête à basculer vers une base persistante.

export function getAllIngredients(): Promise<Ingredient[]> {
  return allIngredients();
}

export function getIngredientBySlug(slug: string): Promise<Ingredient | undefined> {
  return ingredientBySlug(slug);
}

export function getAllSlugs(): Promise<string[]> {
  return allSlugs();
}

export async function getRelated(ingredient: Ingredient): Promise<Ingredient[]> {
  if (!ingredient.related?.length) return [];
  const resolved = await Promise.all(ingredient.related.map((slug) => getIngredientBySlug(slug)));
  return resolved.filter((item): item is Ingredient => Boolean(item));
}

// Réexport pour compatibilité des imports existants.
export { domainLabel } from "@/lib/domains";
