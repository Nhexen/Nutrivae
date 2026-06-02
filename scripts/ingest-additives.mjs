// Ingestion V3 — additifs alimentaires (Open Food Facts) enrichis.
//
//   node scripts/ingest-additives.mjs
//
// Produit data/additives.generated.json (versionné), conforme au type Ingredient.
// V3 : définitions étoffées depuis Wikipédia FR (via le nom, repli Wikidata),
// statuts réglementaires curatés (interdits / restreints UE & France), et états
// physiques curatés pour les cas connus.

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const TAXO_URL = "https://static.openfoodfacts.org/data/taxonomies/additives.json";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "additives.generated.json");
const UA = "Nutrivae/0.3 (ingestion; contact@nutrivae.example)";
const CONCURRENCY = 6;

// E-numbers déjà documentés à la main (la version riche prime).
const CURATED_ENUMBERS = new Set(["330", "951", "211", "422", "322"]);

// Statuts réglementaires curatés (faits documentés, UE / France).
// num → { status, reason, name?, family? }  (name/family servent si l'entrée
// est absente d'Open Food Facts et doit être créée).
const REGULATORY = {
  "171": { status: "interdit", name: "Dioxyde de titane", family: "Colorant", reason: "Interdit comme additif alimentaire dans l'Union européenne depuis 2022 (génotoxicité non exclue, avis EFSA 2021)." },
  "128": { status: "interdit", name: "Rouge 2G", family: "Colorant", reason: "Interdit dans l'Union européenne depuis 2007 (formation d'aniline, avis EFSA)." },
  "216": { status: "interdit", name: "p-hydroxybenzoate de propyle", family: "Conservateur", reason: "Retiré de la liste des additifs alimentaires autorisés dans l'UE (2006)." },
  "217": { status: "interdit", name: "Sel sodique du p-hydroxybenzoate de propyle", family: "Conservateur", reason: "Retiré de la liste des additifs alimentaires autorisés dans l'UE (2006)." },
  "924": { status: "interdit", name: "Bromate de potassium", family: "Agent de traitement de la farine", reason: "Non autorisé comme additif alimentaire dans l'UE (cancérogène)." },
  "240": { status: "interdit", name: "Formaldéhyde", family: "Conservateur", reason: "Non autorisé comme additif alimentaire dans l'Union européenne." },
  "123": { status: "restreint", name: "Amarante", family: "Colorant", reason: "Usage très restreint dans l'UE (limité à certaines boissons spiritueuses et œufs de poisson)." },
  "249": { status: "restreint", name: "Nitrite de potassium", family: "Conservateur", reason: "Doses maximales encadrées (nitrites) ; abaissées en 2023." },
  "250": { status: "restreint", name: "Nitrite de sodium", family: "Conservateur", reason: "Doses maximales encadrées (nitrites) ; abaissées en 2023." },
  "251": { status: "restreint", name: "Nitrate de sodium", family: "Conservateur", reason: "Doses maximales encadrées (nitrates)." },
  "252": { status: "restreint", name: "Nitrate de potassium", family: "Conservateur", reason: "Doses maximales encadrées (nitrates)." },
  "425": { status: "restreint", name: "Konjac", family: "Gélifiant", reason: "Interdit dans les confiseries gélifiées en mini-coupelles (risque d'étouffement)." },
  "121": { status: "interdit", name: "Rouge citrus 2", family: "Colorant", reason: "Non autorisé comme additif alimentaire dans l'Union européenne." },
  "125": { status: "interdit", name: "Ponceau SX", family: "Colorant", reason: "Non autorisé comme additif alimentaire dans l'Union européenne." },
  "952": { status: "restreint", name: "Cyclamate", family: "Édulcorant", reason: "Autorisé sous conditions dans l'UE (doses encadrées) ; interdit aux États-Unis." },
};

// États physiques curatés (cas bien établis). Défaut : indéterminé.
const FORM = {
  // Liquides
  "260": ["liquide", "Liquide (solution acide)"],
  "270": ["liquide", "Liquide sirupeux"],
  "280": ["liquide", "Liquide huileux"],
  "338": ["liquide", "Liquide visqueux"],
  "507": ["liquide", "Liquide (solution)"],
  "513": ["liquide", "Liquide (solution)"],
  "1505": ["liquide", "Liquide incolore"],
  "1518": ["liquide", "Liquide incolore"],
  "1520": ["liquide", "Liquide incolore"],
  // Gaz
  "290": ["gaz", "Gaz"],
  "938": ["gaz", "Gaz"],
  "939": ["gaz", "Gaz"],
  "941": ["gaz", "Gaz"],
  "942": ["gaz", "Gaz"],
  "948": ["gaz", "Gaz"],
  "949": ["gaz", "Gaz"],
  "943a": ["gaz", "Gaz"],
  "944": ["gaz", "Gaz"],
  // Cristaux
  "296": ["cristaux", "Cristaux blancs"],
  "300": ["cristaux", "Poudre cristalline blanche"],
  "334": ["cristaux", "Cristaux incolores"],
  "353": ["cristaux", "Cristaux"],
  "363": ["cristaux", "Cristaux"],
  "621": ["cristaux", "Cristaux blancs"],
  "950": ["cristaux", "Poudre cristalline blanche"],
  "954": ["cristaux", "Poudre cristalline blanche"],
  "955": ["cristaux", "Poudre cristalline blanche"],
  // Poudres notables
  "100": ["poudre", "Poudre orangée"],
  "102": ["poudre", "Poudre jaune"],
  "128": ["poudre", "Poudre rouge"],
  "170": ["poudre", "Poudre blanche"],
  "171": ["poudre", "Poudre blanche"],
  "500": ["poudre", "Poudre blanche"],
  "407": ["poudre", "Poudre"],
  "412": ["poudre", "Poudre"],
  "415": ["poudre", "Poudre"],
  "440": ["poudre", "Poudre"],
};

const CLASS_FR = {
  colour: "Colorant", preservative: "Conservateur", antioxidant: "Antioxydant",
  "acidity-regulator": "Régulateur d'acidité", emulsifier: "Émulsifiant",
  stabiliser: "Stabilisant", thickener: "Épaississant", "gelling-agent": "Gélifiant",
  sweetener: "Édulcorant", "flavour-enhancer": "Exhausteur de goût",
  "raising-agent": "Poudre à lever", "anti-caking-agent": "Antiagglomérant",
  "glazing-agent": "Agent d'enrobage", humectant: "Humectant",
  "flour-treatment-agent": "Agent de traitement de la farine", "firming-agent": "Affermissant",
  sequestrant: "Séquestrant", "foaming-agent": "Agent moussant",
  "anti-foaming-agent": "Antimoussant", "bulking-agent": "Agent de charge",
  carrier: "Support", propellant: "Gaz propulseur", "packaging-gas": "Gaz d'emballage",
  "modified-starch": "Amidon modifié", "colour-retention-agent": "Stabilisateur de couleur",
};

function classLabel(raw) {
  if (!raw) return null;
  const labels = raw.split(",").map((c) => c.trim().replace(/^en:/, ""))
    .map((c) => CLASS_FR[c] ?? c.replace(/-/g, " ").replace(/^\w/, (m) => m.toUpperCase()))
    .filter(Boolean);
  return labels.length ? [...new Set(labels)].join(" · ") : null;
}

function stripCode(name) {
  if (!name) return null;
  return name.replace(/^E\d+[a-z]*\s*[-–]\s*/i, "").trim() || null;
}

function slugify(value) {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function compat(flag) {
  if (flag === "yes") return "oui";
  if (flag === "no") return "non";
  return "à-vérifier";
}

async function fetchJson(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) });
      if (r.status === 429) {
        await new Promise((res) => setTimeout(res, 1000 * (attempt + 1)));
        continue;
      }
      if (!r.ok) return null;
      return await r.json();
    } catch {
      await new Promise((res) => setTimeout(res, 500));
    }
  }
  return null;
}

// Extraits Wikipédia FR en lot via l'API MediaWiki (suit les redirections).
// Renvoie une Map titreOriginal → { title, extract, wikidata }.
async function fetchExtracts(titles) {
  const result = new Map();
  const BATCH = 20;
  const base = "https://fr.wikipedia.org/w/api.php";
  for (let i = 0; i < titles.length; i += BATCH) {
    const slice = titles.slice(i, i + BATCH);
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      formatversion: "2",
      redirects: "1",
      prop: "extracts|pageprops",
      exintro: "1",
      explaintext: "1",
      exsentences: "4",
      ppprop: "wikibase_item",
      titles: slice.join("|"),
    });
    const d = await fetchJson(`${base}?${params}`);
    if (i % 100 === 0) console.log(`  … ${Math.min(i + BATCH, titles.length)}/${titles.length}`);
    if (!d?.query) continue;

    // Résolution titre demandé → titre final (normalisation puis redirection).
    const norm = new Map((d.query.normalized ?? []).map((x) => [x.from, x.to]));
    const redir = new Map((d.query.redirects ?? []).map((x) => [x.from, x.to]));
    const byTitle = new Map((d.query.pages ?? []).map((p) => [p.title, p]));
    const resolve = (t) => {
      const a = norm.get(t) ?? t;
      return redir.get(a) ?? a;
    };
    for (const t of slice) {
      const page = byTitle.get(resolve(t));
      if (page && !page.missing && page.extract && page.extract.length > 40) {
        result.set(t, {
          title: page.title,
          extract: page.extract.replace(/\s+/g, " ").trim(),
          wikidata: page.pageprops?.wikibase_item,
        });
      }
    }
  }
  return result;
}

function firstSentence(text, max = 220) {
  const cut = text.slice(0, max);
  const stop = cut.lastIndexOf(". ");
  return (stop > 60 ? cut.slice(0, stop + 1) : cut).trim();
}

function buildEntry(num, frName, enName, family, wikidata, hasEfsa, vegan, summary) {
  const eCode = `E${num}`;
  const reg = REGULATORY[num];
  const status = reg?.status ?? "autorise";
  const [form, formLabel] = FORM[num] ?? ["indetermine", "Forme non documentée"];

  const regulation = [
    { label: "Statut UE", value: status === "interdit" ? "Interdit" : status === "restreint" ? "Autorisé sous conditions" : "Autorisé" },
    { label: "Numéro E", value: eCode },
    { label: "Classe(s)", value: family },
  ];
  if (reg) {
    regulation.push({
      label: status === "interdit" ? "Interdiction" : "Restriction",
      value: reg.reason,
      risk: status === "interdit" ? "danger" : "warn",
    });
  }
  if (hasEfsa) regulation.push({ label: "Évaluation EFSA", value: "Documentée (voir sources)" });

  const statusPhrase =
    status === "interdit"
      ? "aujourd'hui interdit comme additif alimentaire dans l'Union européenne"
      : status === "restreint"
        ? "autorisé sous conditions dans l'Union européenne"
        : "autorisé comme additif alimentaire dans l'Union européenne";

  const definition = summary
    ? [summary.extract]
    : [
        `${frName} (${eCode}) est un additif alimentaire ${statusPhrase}, classé dans la famille « ${family} ».`,
        `Sa fonction technologique relève de la catégorie « ${family.toLowerCase()} ». Les données présentées proviennent des bases publiques de référence.`,
      ];

  const plain = summary
    ? firstSentence(summary.extract)
    : `${frName} (${eCode}) est un additif alimentaire (${family.toLowerCase()}), ${statusPhrase}.`;

  const statusLine = reg
    ? reg.reason
    : "Additif alimentaire autorisé dans l'Union européenne.";

  return {
    slug: `${slugify(frName)}-${num}`,
    refs: {
      ...(enName ? { pubchem: enName } : {}),
      offAdditive: `e${num}`,
      ...(summary?.title ? { wikipediaFr: summary.title } : {}),
      ...(wikidata ? { wikidata } : {}),
    },
    name: frName,
    aliases: [eCode],
    domains: ["alimentaire"],
    family,
    tags: ["Additif alimentaire", family],
    status: statusLine,
    summary: `${frName} (${eCode}) — additif alimentaire, ${family.toLowerCase()}.`,
    regulatoryStatus: status,
    controversy: reg ? (status === "interdit" ? "controverse" : "avis-en-cours") : "aucune",
    contraindications: [],
    plain,
    form,
    formLabel,
    definition,
    ...(summary ? { definitionSource: "wikipedia" } : {}),
    role: [`Fonction technologique principale : ${family.toLowerCase()}.`],
    foundIn: [],
    regulation,
    compatibility: {
      vegan: compat(vegan),
      halal: "à-vérifier",
      casher: "à-vérifier",
      allergenes: "Non documenté automatiquement — à vérifier selon la source.",
    },
    science: {
      kind: "none",
      note: "Aucune synthèse de controverse n'a encore été rédigée pour cette entrée. Les évaluations de sécurité de référence sont accessibles via les sources ci-dessous.",
    },
    related: [],
  };
}

async function main() {
  console.log("→ Téléchargement de la taxonomie Open Food Facts…");
  const taxo = await fetchJson(TAXO_URL);
  if (!taxo) throw new Error("Taxonomie OFF inaccessible");

  const sources = [];
  for (const [key, entry] of Object.entries(taxo)) {
    const num = entry?.e_number?.en;
    if (!num || !/^en:e\d+$/.test(key)) continue;
    if (CURATED_ENUMBERS.has(num)) continue;
    sources.push({
      num,
      frName: stripCode(entry.name?.fr) ?? stripCode(entry.name?.en) ?? `E${num}`,
      enName: stripCode(entry.name?.en),
      family: classLabel(entry.additives_classes?.en) ?? "Additif alimentaire",
      wikidata: entry.wikidata?.en,
      hasEfsa: Boolean(entry.efsa_evaluation?.en),
      vegan: entry.vegan?.en,
    });
  }

  // Ajout des entrées réglementées absentes d'OFF (ex. additifs interdits).
  const present = new Set(sources.map((s) => s.num));
  for (const [num, reg] of Object.entries(REGULATORY)) {
    if (!present.has(num) && reg.name) {
      sources.push({ num, frName: reg.name, enName: null, family: reg.family ?? "Additif alimentaire", wikidata: undefined, hasEfsa: false, vegan: undefined });
    }
  }

  console.log(`→ Enrichissement Wikipédia (lots) de ${sources.length} additifs…`);
  const extracts = await fetchExtracts(sources.map((s) => s.frName));
  let enriched = 0;
  const out = sources.map((s) => {
    const summary = extracts.get(s.frName) ?? null;
    if (summary) enriched++;
    return buildEntry(s.num, s.frName, s.enName, s.family, s.wikidata ?? summary?.wikidata, s.hasEfsa, s.vegan, summary);
  });

  out.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");

  const interdits = out.filter((o) => o.regulatoryStatus === "interdit").length;
  const restreints = out.filter((o) => o.regulatoryStatus === "restreint").length;
  console.log(`✓ ${out.length} additifs écrits.`);
  console.log(`  • enrichis via Wikipédia : ${enriched}`);
  console.log(`  • interdits : ${interdits} | restreints : ${restreints}`);
}

main().catch((err) => {
  console.error("✗ Ingestion échouée :", err.message);
  process.exit(1);
});
