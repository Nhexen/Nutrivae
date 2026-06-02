// Ingestion V6 — ingrédients cosmétiques (INCI) depuis Open Beauty Facts.
//
//   node scripts/ingest-cosmetics.mjs
//
// Produit data/cosmetics.generated.json (versionné). On ingère un ensemble
// curaté d'ingrédients cosmétiques courants (ceux réellement recherchés),
// enrichis via Wikipédia FR. Domaine : cosmétique.

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const TAXO_URL = "https://static.openbeautyfacts.org/data/taxonomies/ingredients.json";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "cosmetics.generated.json");
const UA = "Nutrivae/0.6 (ingestion; contact@nutrivae.example)";

// Ingrédients cosmétiques courants (clés Open Beauty Facts). Les absents sont ignorés.
const KEYS = [
  "en:glycerin", "en:niacinamide", "en:hyaluronic-acid", "en:sodium-hyaluronate", "en:retinol",
  "en:tocopherol", "en:ascorbic-acid", "en:salicylic-acid", "en:sodium-lauryl-sulfate",
  "en:sodium-laureth-sulfate", "en:cocamidopropyl-betaine", "en:phenoxyethanol", "en:parfum",
  "en:limonene", "en:linalool", "en:dimethicone", "en:cyclopentasiloxane", "en:panthenol",
  "en:allantoin", "en:alcohol-denat", "en:butylene-glycol", "en:propylene-glycol",
  "en:cetearyl-alcohol", "en:stearic-acid", "en:glyceryl-stearate", "en:titanium-dioxide",
  "en:zinc-oxide", "en:benzyl-alcohol", "en:potassium-sorbate", "en:sodium-benzoate",
  "en:methylparaben", "en:propylparaben", "en:butylparaben", "en:ethylparaben", "en:bht", "en:bha",
  "en:disodium-edta", "en:xanthan-gum", "en:carbomer", "en:lactic-acid", "en:urea", "en:squalane",
  "en:caffeine", "en:kaolin", "en:talc", "en:mica", "en:sodium-chloride", "en:sodium-hydroxide",
  "en:glycolic-acid", "en:coumarin", "en:geraniol", "en:citronellol", "en:menthol", "en:dimethiconol",
];

const FUNC_FR = {
  humectant: "Humectant", "skin-conditioning": "Agent de soin de la peau",
  "skin-protecting": "Protecteur cutané", "hair-conditioning": "Soin capillaire",
  emulsifying: "Émulsifiant", surfactant: "Tensioactif", cleansing: "Nettoyant",
  antioxidant: "Antioxydant", preservative: "Conservateur", masking: "Masquant",
  perfuming: "Parfumant", "viscosity-controlling": "Agent de viscosité", emollient: "Émollient",
  moisturising: "Hydratant", antistatic: "Antistatique", denaturant: "Dénaturant",
  solvent: "Solvant", smoothing: "Lissant", "film-forming": "Filmogène", "uv-filter": "Filtre UV",
  buffering: "Tampon (pH)", chelating: "Chélateur", abrasive: "Abrasif", binding: "Liant",
  opacifying: "Opacifiant", bulking: "Agent de charge", exfoliating: "Exfoliant",
  soothing: "Apaisant", "oral-care": "Soin bucco-dentaire", foaming: "Moussant",
  "anticaking": "Antiagglomérant", tonic: "Tonifiant", "skin-bleaching": "Éclaircissant",
};

const FORM = {
  "en:glycerin": ["liquide", "Liquide visqueux"], "en:dimethicone": ["liquide", "Liquide (silicone)"],
  "en:cyclopentasiloxane": ["liquide", "Liquide (silicone)"], "en:dimethiconol": ["liquide", "Liquide (silicone)"],
  "en:propylene-glycol": ["liquide", "Liquide incolore"], "en:butylene-glycol": ["liquide", "Liquide incolore"],
  "en:parfum": ["liquide", "Liquide odorant"], "en:alcohol-denat": ["liquide", "Liquide"],
  "en:titanium-dioxide": ["poudre", "Poudre blanche"], "en:zinc-oxide": ["poudre", "Poudre blanche"],
  "en:talc": ["poudre", "Poudre"], "en:mica": ["poudre", "Poudre minérale"], "en:kaolin": ["poudre", "Poudre (argile)"],
  "en:sodium-chloride": ["cristaux", "Cristaux"], "en:citric-acid": ["cristaux", "Poudre cristalline"],
};

function funcLabel(raw) {
  if (!raw) return null;
  const labels = raw.split(",").map((c) => c.trim().replace(/^en:/, ""))
    .map((c) => FUNC_FR[c] ?? c.replace(/-/g, " ").replace(/^\w/, (m) => m.toUpperCase()))
    .filter(Boolean);
  return labels.length ? [...new Set(labels)].slice(0, 3).join(" · ") : null;
}

function titleCase(s) {
  return s.toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
}

function slugify(value) {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function fetchJson(url) {
  for (let a = 0; a < 3; a++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) });
      if (r.status === 429) { await new Promise((x) => setTimeout(x, 800 * (a + 1))); continue; }
      if (!r.ok) return null;
      return await r.json();
    } catch { await new Promise((x) => setTimeout(x, 400)); }
  }
  return null;
}

// Extraits Wikipédia FR en lot.
async function fetchExtracts(titles) {
  const result = new Map();
  for (let i = 0; i < titles.length; i += 20) {
    const slice = titles.slice(i, i + 20);
    const p = new URLSearchParams({
      action: "query", format: "json", formatversion: "2", redirects: "1",
      prop: "extracts|pageprops", exintro: "1", explaintext: "1", exsentences: "4",
      ppprop: "wikibase_item", titles: slice.join("|"),
    });
    const d = await fetchJson(`https://fr.wikipedia.org/w/api.php?${p}`);
    if (!d?.query) continue;
    const norm = new Map((d.query.normalized ?? []).map((x) => [x.from, x.to]));
    const redir = new Map((d.query.redirects ?? []).map((x) => [x.from, x.to]));
    const byTitle = new Map((d.query.pages ?? []).map((pg) => [pg.title, pg]));
    for (const t of slice) {
      const page = byTitle.get(redir.get(norm.get(t) ?? t) ?? norm.get(t) ?? t);
      if (page && !page.missing && page.extract && page.extract.length > 40) {
        result.set(t, { title: page.title, extract: page.extract.replace(/\s+/g, " ").trim(), wikidata: page.pageprops?.wikibase_item });
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

async function main() {
  console.log("→ Téléchargement de la taxonomie Open Beauty Facts…");
  const taxo = await fetchJson(TAXO_URL);
  if (!taxo) throw new Error("Taxonomie OBF inaccessible");

  const sources = [];
  for (const key of KEYS) {
    const e = taxo[key];
    if (!e) { console.log("  (absent)", key); continue; }
    const inci = titleCase((e.name?.en ?? key.replace(/^en:/, "")).trim());
    const frName = e.name?.fr && !/^\(/.test(e.name.fr) ? e.name.fr.replace(/\.$/, "").trim() : inci;
    const family = funcLabel(e.inci_functions?.en) ?? "Ingrédient cosmétique";
    sources.push({
      key, inci, frName, family,
      cas: e.cas?.en, wikidata: e.wikidata?.en, cosing: e.cosing?.en,
      queryTitle: frName,
    });
  }

  console.log(`→ Enrichissement Wikipédia de ${sources.length} ingrédients…`);
  const extracts = await fetchExtracts(sources.map((s) => s.queryTitle));
  let enriched = 0;

  const out = sources.map((s) => {
    const summary = extracts.get(s.queryTitle) ?? null;
    if (summary) enriched++;
    const [form, formLabel] = FORM[s.key] ?? ["indetermine", "Forme non documentée"];
    const aliases = [s.inci];
    if (s.cas) aliases.push(`CAS ${s.cas}`);

    const definition = summary
      ? [summary.extract]
      : [
          `${s.frName} (INCI : ${s.inci}) est un ingrédient cosmétique de fonction « ${s.family} », autorisé dans l'Union européenne.`,
          "Les données présentées proviennent des bases publiques (Open Beauty Facts, CosIng).",
        ];

    return {
      slug: `${slugify(s.frName)}-inci`,
      refs: {
        pubchem: s.inci,
        ...(summary?.title ? { wikipediaFr: summary.title } : {}),
        ...(s.wikidata ? { wikidata: s.wikidata } : {}),
        cosing: s.inci,
      },
      name: s.frName,
      aliases,
      domains: ["cosmétique"],
      family: s.family,
      tags: ["Ingrédient cosmétique", s.family.split(" · ")[0]],
      status: "Ingrédient cosmétique d'usage courant, autorisé dans l'Union européenne.",
      summary: `${s.frName} (INCI : ${s.inci}) — ingrédient cosmétique, ${s.family.toLowerCase()}.`,
      regulatoryStatus: "autorise",
      controversy: "aucune",
      contraindications: [],
      plain: summary ? firstSentence(summary.extract) : `${s.frName} (INCI : ${s.inci}) est un ingrédient cosmétique courant (${s.family.toLowerCase()}).`,
      form,
      formLabel,
      definition,
      ...(summary ? { definitionSource: "wikipedia" } : {}),
      role: [`Fonction cosmétique : ${s.family.toLowerCase()}.`],
      foundIn: [],
      regulation: [
        { label: "Statut UE (cosmétique)", value: "Autorisé" },
        { label: "Référence INCI", value: s.inci },
        ...(s.cas ? [{ label: "Numéro CAS", value: s.cas }] : []),
      ],
      compatibility: {
        vegan: "à-vérifier", halal: "à-vérifier", casher: "à-vérifier",
        allergenes: "Non documenté automatiquement — à vérifier selon la source.",
      },
      science: { kind: "none", note: "Aucune synthèse de controverse n'a encore été rédigée pour cette entrée. Voir les sources ci-dessous." },
      related: [],
    };
  });

  out.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`✓ ${out.length} ingrédients cosmétiques écrits (enrichis Wikipédia : ${enriched}).`);
}

main().catch((e) => { console.error("✗", e.message); process.exit(1); });
