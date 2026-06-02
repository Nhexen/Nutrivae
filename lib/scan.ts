import type { ControversyLevel, Ingredient, RegulatoryStatus } from "@/data/types";

// Index léger pour la reconnaissance d'une liste d'ingrédients (OCR ou texte).
export interface ScanEntry {
  slug: string;
  name: string;
  code: string; // alias principal (E-number, INCI, nom chimique)
  eNumber: string | null; // ex. "e330"
  terms: string[]; // formes normalisées à rechercher (nom + alias)
  regulatoryStatus: RegulatoryStatus;
  controversy: ControversyLevel;
  family: string;
}

export interface ScanMatch {
  entry: ScanEntry;
  via: string; // terme détecté
}

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

export function toScanEntry(i: Ingredient): ScanEntry {
  const m = i.aliases[0]?.match(/^E(\d{3,4}[a-z]?)$/i);
  const terms = [i.name, ...i.aliases]
    .map((t) => normalize(t.replace(/^(INCI|CAS)\s*:?\s*/i, "")))
    // Longueur suffisante, et on exclut les codes E (gérés précisément par eNumber).
    .filter((t) => t.length >= 4 && !/^e\d{2,4}[a-z]?$/.test(t));
  return {
    slug: i.slug,
    name: i.name,
    code: i.aliases[0] ?? i.name,
    eNumber: m ? `e${m[1].toLowerCase()}` : null,
    terms: [...new Set(terms)],
    regulatoryStatus: i.regulatoryStatus,
    controversy: i.controversy,
    family: i.family,
  };
}

const RISK_ORDER: Record<string, number> = { interdit: 0, restreint: 1 };

// Reconnaît les substances de l'index présentes dans un texte (OCR ou collé).
export function matchText(entries: ScanEntry[], rawText: string): ScanMatch[] {
  const text = normalize(rawText);
  if (text.length < 2) return [];

  // E-numbers présents dans le texte : « E330 », « E 330 », « E-330 ».
  const codes = new Set<string>();
  for (const m of text.matchAll(/\be[\s-]?(\d{3,4}[a-z]?)\b/g)) codes.add(`e${m[1]}`);

  const found = new Map<string, ScanMatch>();
  for (const entry of entries) {
    if (entry.eNumber && codes.has(entry.eNumber)) {
      found.set(entry.slug, { entry, via: entry.code });
      continue;
    }
    for (const term of entry.terms) {
      // Frontières de mot pour limiter les faux positifs.
      const re = new RegExp(`(^|[^a-z0-9])${escapeRegex(term)}([^a-z0-9]|$)`);
      if (re.test(text)) {
        found.set(entry.slug, { entry, via: term });
        break;
      }
    }
  }

  // Dédoublonnage par nom (même substance présente dans plusieurs domaines) :
  // on privilégie l'entrée disposant d'un code E.
  const byName = new Map<string, ScanMatch>();
  for (const m of found.values()) {
    const key = normalize(m.entry.name);
    const ex = byName.get(key);
    if (!ex || (!ex.entry.eNumber && m.entry.eNumber)) byName.set(key, m);
  }

  return [...byName.values()].sort((a, a2) => {
    const ra = RISK_ORDER[a.entry.regulatoryStatus] ?? (a.entry.controversy !== "aucune" ? 2 : 3);
    const rb = RISK_ORDER[a2.entry.regulatoryStatus] ?? (a2.entry.controversy !== "aucune" ? 2 : 3);
    return ra - rb || a.entry.name.localeCompare(a2.entry.name, "fr");
  });
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
