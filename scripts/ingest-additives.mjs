// Ingestion V2 — additifs alimentaires depuis la taxonomie Open Food Facts.
//
//   node scripts/ingest-additives.mjs
//
// Produit data/additives.generated.json (versionné), conforme au type Ingredient.
// Les faits proviennent des bases publiques ; les champs éditoriaux (plain,
// definition, controverses) sont des amorces honnêtes, à enrichir.
//
// Les E-numbers déjà curatés à la main sont ignorés (la version riche prime).

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const TAXO_URL = "https://static.openfoodfacts.org/data/taxonomies/additives.json";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "additives.generated.json");

// E-numbers déjà documentés manuellement dans data/ingredients.ts (à ne pas écraser).
const CURATED_ENUMBERS = new Set(["330", "951", "211", "422", "322"]);

// Classes fonctionnelles OFF (en:) → libellés français.
const CLASS_FR = {
  colour: "Colorant",
  preservative: "Conservateur",
  antioxidant: "Antioxydant",
  "acidity-regulator": "Régulateur d'acidité",
  emulsifier: "Émulsifiant",
  stabiliser: "Stabilisant",
  thickener: "Épaississant",
  "gelling-agent": "Gélifiant",
  sweetener: "Édulcorant",
  "flavour-enhancer": "Exhausteur de goût",
  "raising-agent": "Poudre à lever",
  "anti-caking-agent": "Antiagglomérant",
  "glazing-agent": "Agent d'enrobage",
  humectant: "Humectant",
  "flour-treatment-agent": "Agent de traitement de la farine",
  "firming-agent": "Affermissant",
  sequestrant: "Séquestrant",
  "foaming-agent": "Agent moussant",
  "anti-foaming-agent": "Antimoussant",
  "bulking-agent": "Agent de charge",
  carrier: "Support",
  propellant: "Gaz propulseur",
  "packaging-gas": "Gaz d'emballage",
  "modified-starch": "Amidon modifié",
  "colour-retention-agent": "Stabilisateur de couleur",
};

function classLabel(raw) {
  // raw : "en:colour, en:antioxidant"
  if (!raw) return null;
  const labels = raw
    .split(",")
    .map((c) => c.trim().replace(/^en:/, ""))
    .map((c) => CLASS_FR[c] ?? c.replace(/-/g, " ").replace(/^\w/, (m) => m.toUpperCase()))
    .filter(Boolean);
  return labels.length ? [...new Set(labels)].join(" · ") : null;
}

function stripCode(name) {
  // "E330 - Acide citrique" → "Acide citrique"
  if (!name) return null;
  return name.replace(/^E\d+[a-z]*\s*[-–]\s*/i, "").trim() || null;
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function compat(flag) {
  if (flag === "yes") return "oui";
  if (flag === "no") return "non";
  if (flag === "maybe") return "à-vérifier";
  return "à-vérifier";
}

async function main() {
  console.log("→ Téléchargement de la taxonomie Open Food Facts…");
  const res = await fetch(TAXO_URL, { headers: { "User-Agent": "Nutrivae/0.2 (ingestion)" } });
  if (!res.ok) throw new Error(`OFF taxonomy HTTP ${res.status}`);
  const taxo = await res.json();

  const out = [];
  let skipped = 0;

  for (const [key, entry] of Object.entries(taxo)) {
    const num = entry?.e_number?.en;
    if (!num || !/^en:e\d+$/.test(key)) continue; // entrées canoniques uniquement
    if (CURATED_ENUMBERS.has(num)) {
      skipped++;
      continue;
    }

    const eCode = `E${num}`;
    const frName = stripCode(entry.name?.fr) ?? stripCode(entry.name?.en) ?? eCode;
    const enName = stripCode(entry.name?.en);
    const family = classLabel(entry.additives_classes?.en) ?? "Additif alimentaire";
    const wikidata = entry.wikidata?.en;
    const hasEfsa = Boolean(entry.efsa_evaluation?.en);

    const regulation = [
      { label: "Statut UE", value: "Autorisé" },
      { label: "Numéro E", value: eCode },
      { label: "Classe(s)", value: family },
    ];
    if (hasEfsa) regulation.push({ label: "Évaluation EFSA", value: "Documentée (voir sources)" });

    out.push({
      slug: `${slugify(frName)}-${num}`,
      refs: {
        ...(enName ? { pubchem: enName } : {}),
        offAdditive: `e${num}`,
        ...(wikidata ? { wikidata } : {}),
      },
      name: frName,
      aliases: [eCode],
      domains: ["alimentaire"],
      family,
      tags: ["Additif alimentaire", family],
      status: "Additif alimentaire autorisé dans l'Union européenne.",
      summary: `${frName} (${eCode}) — additif alimentaire, ${family.toLowerCase()}.`,
      regulatoryStatus: "autorise",
      controversy: "aucune",
      contraindications: [],
      plain: `${frName} (${eCode}) est un additif alimentaire autorisé dans l'Union européenne, de la famille « ${family} ». Cette notice est générée à partir des bases publiques et en cours d'enrichissement éditorial.`,
      form: "solide",
      formLabel: "Forme non précisée",
      definition: [
        `${frName} (${eCode}) est répertorié comme additif alimentaire autorisé dans l'Union européenne, de la famille « ${family} ».`,
        "Cette fiche est en cours de rédaction : les données factuelles ci-dessous proviennent d'Open Food Facts et des bases publiques associées.",
      ],
      role: [`Fonction technologique principale : ${family.toLowerCase()}.`],
      foundIn: [],
      regulation,
      compatibility: {
        vegan: compat(entry.vegan?.en),
        halal: "à-vérifier",
        casher: "à-vérifier",
        allergenes: "Non documenté automatiquement — à vérifier selon la source.",
      },
      science: {
        kind: "none",
        note: "Aucune synthèse de controverse n'a encore été rédigée pour cette entrée. Les évaluations de sécurité de référence sont accessibles via les sources ci-dessous.",
      },
      related: [],
    });
  }

  out.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`✓ ${out.length} additifs écrits dans data/additives.generated.json (${skipped} curatés ignorés).`);
}

main().catch((err) => {
  console.error("✗ Ingestion échouée :", err.message);
  process.exit(1);
});
