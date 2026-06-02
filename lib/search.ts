import type { Domain, Ingredient, RegulatoryStatus } from "@/data/types";

// Index de recherche léger, sérialisable et passé au client.
// Pas de dépendance à la base : la recherche reste instantanée côté client
// pour des volumes modestes (V1/V2). À grande échelle → moteur dédié (voir doc).
export interface SearchItem {
  slug: string;
  name: string;
  aliases: string[];
  family: string;
  domains: Domain[];
  summary: string;
  regulatoryStatus: RegulatoryStatus;
}

export function toSearchItem(i: Ingredient): SearchItem {
  return {
    slug: i.slug,
    name: i.name,
    aliases: i.aliases,
    family: i.family,
    domains: i.domains,
    summary: i.summary,
    regulatoryStatus: i.regulatoryStatus,
  };
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Recherche tolérante (nom, alias, famille, domaines, résumé), pondérée.
export function searchItems(items: SearchItem[], query: string): SearchItem[] {
  const q = normalize(query.trim());
  if (!q) return [];

  return items
    .map((item) => {
      const fields: Array<{ text: string; weight: number }> = [
        { text: item.name, weight: 5 },
        { text: item.aliases.join(" "), weight: 4 },
        { text: item.family, weight: 2 },
        { text: item.domains.join(" "), weight: 1 },
        { text: item.summary, weight: 1 },
      ];
      let score = 0;
      for (const { text, weight } of fields) {
        const n = normalize(text);
        if (n.startsWith(q)) score += weight * 3;
        else if (n.includes(q)) score += weight;
      }
      return { item, score };
    })
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((e) => e.item);
}
