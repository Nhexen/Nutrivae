// Ingestion V7 — substances des produits ménagers (domaine « ménager ».
//
//   node scripts/ingest-household.mjs
//
// Dataset curaté de substances ménagères courantes, DISTINCTES des additifs
// alimentaires déjà couverts (pour éviter les doublons). Enrichi via Wikipédia FR.
// Produit data/household.generated.json.

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "household.generated.json");
const UA = "Nutrivae/0.7 (ingestion; contact@nutrivae.example)";

// Substances ménagères curatées.
// { name, en?, family, form, formLabel, status?, reason?, chimique? }
const HOUSEHOLD = [
  { name: "Hypochlorite de sodium", en: "sodium hypochlorite", family: "Désinfectant · Agent de blanchiment", form: "liquide", formLabel: "Liquide (eau de Javel)", chimique: true },
  { name: "Hypochlorite de calcium", en: "calcium hypochlorite", family: "Désinfectant · Agent de blanchiment", form: "poudre", formLabel: "Poudre blanche" },
  { name: "Percarbonate de sodium", en: "sodium percarbonate", family: "Agent de blanchiment", form: "poudre", formLabel: "Poudre blanche" },
  { name: "Perborate de sodium", en: "sodium perborate", family: "Agent de blanchiment", form: "poudre", formLabel: "Poudre blanche", status: "restreint", reason: "Borate classé toxique pour la reproduction (CMR) : usage restreint dans l'UE (REACH)." },
  { name: "Peroxyde d'hydrogène", en: "hydrogen peroxide", family: "Désinfectant · Agent de blanchiment", form: "liquide", formLabel: "Liquide (eau oxygénée)", chimique: true },
  { name: "Tétraacétyléthylènediamine", en: "tetraacetylethylenediamine", family: "Activateur de blanchiment", form: "poudre", formLabel: "Poudre" },
  { name: "Laureth sulfate de sodium", en: "sodium laureth sulfate", family: "Tensioactif", form: "liquide", formLabel: "Liquide visqueux" },
  { name: "Dodécylbenzènesulfonate de sodium", en: "sodium dodecylbenzenesulfonate", family: "Tensioactif", form: "poudre", formLabel: "Poudre / pâte" },
  { name: "Cocamidopropyl bétaïne", en: "cocamidopropyl betaine", family: "Tensioactif doux", form: "liquide", formLabel: "Liquide visqueux" },
  { name: "Chlorure de benzalkonium", en: "benzalkonium chloride", family: "Désinfectant (ammonium quaternaire)", form: "liquide", formLabel: "Liquide", chimique: true },
  { name: "Chlorure de didécyldiméthylammonium", en: "didecyldimethylammonium chloride", family: "Désinfectant (ammonium quaternaire)", form: "liquide", formLabel: "Liquide" },
  { name: "Méthylisothiazolinone", en: "methylisothiazolinone", family: "Conservateur", form: "liquide", formLabel: "Liquide (solution)", status: "restreint", reason: "Allergène de contact : concentration réglementée dans l'UE." },
  { name: "Méthylchloroisothiazolinone", en: "methylchloroisothiazolinone", family: "Conservateur", form: "liquide", formLabel: "Liquide (solution)", status: "restreint", reason: "Allergène de contact : usage et concentration réglementés dans l'UE." },
  { name: "Édétate de tétrasodium", en: "tetrasodium EDTA", family: "Chélateur (séquestrant)", form: "poudre", formLabel: "Poudre blanche" },
  { name: "Zéolithe", en: "zeolite", family: "Adoucisseur d'eau", form: "poudre", formLabel: "Poudre minérale" },
  { name: "Subtilisine", en: "subtilisin", family: "Enzyme (protéase)", form: "poudre", formLabel: "Poudre / granulés" },
  { name: "Propan-2-ol", en: "isopropyl alcohol", family: "Solvant · Désinfectant", form: "liquide", formLabel: "Liquide (alcool isopropylique)", chimique: true },
  { name: "2-Butoxyéthanol", en: "2-butoxyethanol", family: "Solvant", form: "liquide", formLabel: "Liquide", chimique: true, status: "restreint", reason: "Substance nocive : étiquetage et conditions d'emploi encadrés (CLP / REACH)." },
  { name: "Monoéthanolamine", en: "ethanolamine", family: "Agent alcalin · Solvant", form: "liquide", formLabel: "Liquide visqueux", chimique: true },
  { name: "Acide sulfamique", en: "sulfamic acid", family: "Détartrant", form: "cristaux", formLabel: "Cristaux blancs" },
  { name: "White-spirit", en: "white spirit", family: "Solvant", form: "liquide", formLabel: "Liquide (solvant pétrolier)", chimique: true },
  { name: "Glutaraldéhyde", en: "glutaraldehyde", family: "Désinfectant", form: "liquide", formLabel: "Liquide (solution)", chimique: true, status: "restreint", reason: "Biocide sensibilisant : usage encadré (règlement biocides UE)." },
  { name: "Savon", en: "soap", family: "Tensioactif", form: "solide", formLabel: "Solide ou liquide" },
  { name: "Térébenthine", en: "turpentine", family: "Solvant", form: "liquide", formLabel: "Liquide (essence)", chimique: true },
];

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
  console.log(`→ Enrichissement Wikipédia de ${HOUSEHOLD.length} substances ménagères…`);
  const extracts = await fetchExtracts(HOUSEHOLD.map((h) => h.name));
  let enriched = 0;

  const out = HOUSEHOLD.map((h) => {
    const summary = extracts.get(h.name) ?? null;
    if (summary) enriched++;
    const status = h.status ?? "autorise";
    const domains = h.chimique ? ["ménager", "chimique"] : ["ménager"];

    const regulation = [
      { label: "Cadre UE", value: status === "restreint" ? "Usage réglementé" : "Usage courant autorisé" },
      { label: "Famille", value: h.family },
    ];
    if (h.reason) regulation.push({ label: "Restriction", value: h.reason, risk: "warn" });

    const definition = summary
      ? [summary.extract]
      : [
          `${h.name} est une substance de la famille « ${h.family} », employée dans les produits d'entretien.`,
          "Les données présentées proviennent des bases publiques de référence.",
        ];

    return {
      slug: `${slugify(h.name)}-menager`,
      refs: {
        ...(h.en ? { pubchem: h.en } : {}),
        ...(summary?.title ? { wikipediaFr: summary.title } : {}),
        ...(summary?.wikidata ? { wikidata: summary.wikidata } : {}),
      },
      name: h.name,
      aliases: h.en ? [titleCase(h.en)] : [h.name],
      domains,
      family: h.family,
      tags: ["Produit ménager", h.family.split(" · ")[0]],
      status: h.reason ?? "Substance d'usage courant dans les produits d'entretien.",
      summary: `${h.name} — usage ménager, ${h.family.toLowerCase()}.`,
      regulatoryStatus: status,
      controversy: status === "restreint" ? "avis-en-cours" : "aucune",
      contraindications: [],
      plain: summary ? firstSentence(summary.extract) : `${h.name} est une substance d'entretien courante (${h.family.toLowerCase()}).`,
      form: h.form,
      formLabel: h.formLabel,
      definition,
      ...(summary ? { definitionSource: "wikipedia" } : {}),
      role: [`Fonction principale : ${h.family.toLowerCase()}.`],
      foundIn: [],
      regulation,
      compatibility: {
        vegan: "sans-objet", halal: "sans-objet", casher: "sans-objet",
        allergenes: status === "restreint" ? "Substance sensibilisante possible — voir restriction." : "Sans objet pour un usage non alimentaire.",
      },
      science: { kind: "none", note: "Aucune synthèse n'a encore été rédigée pour cette entrée. Voir les sources ci-dessous." },
      related: [],
    };
  });

  out.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`✓ ${out.length} substances ménagères écrites (enrichies Wikipédia : ${enriched}).`);
}

main().catch((e) => { console.error("✗", e.message); process.exit(1); });
