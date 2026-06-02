// Récupère les descriptions PubChem (PUG-View) en anglais pour les additifs
// dépourvus d'extrait Wikipédia. Produit data/pubchem-desc.en.json (intermédiaire).
//
//   node scripts/fetch-pubchem-desc.mjs
//
// Ces textes anglais sont ensuite traduits en français (data/descriptions.fr.json)
// pour alimenter l'ingestion.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const UA = "Nutrivae/0.5 (ingestion; contact@nutrivae.example)";

async function getJson(url) {
  for (let a = 0; a < 3; a++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) });
      if (r.status === 429 || r.status === 503) { await new Promise((x) => setTimeout(x, 800 * (a + 1))); continue; }
      if (!r.ok) return null;
      return await r.json();
    } catch { await new Promise((x) => setTimeout(x, 400)); }
  }
  return null;
}

function firstDescription(record) {
  let txt = null;
  const walk = (s) => {
    if (txt) return;
    for (const inf of s.Information ?? []) {
      const sw = inf.Value?.StringWithMarkup?.[0]?.String;
      if (sw && sw.length > 40) { txt = sw; return; }
    }
    for (const ss of s.Section ?? []) walk(ss);
  };
  for (const s of record?.Record?.Section ?? []) walk(s);
  return txt;
}

async function main() {
  const all = JSON.parse(await readFile(join(ROOT, "data", "additives.generated.json"), "utf8"));
  const targets = all.filter((x) => !x.definitionSource && x.refs?.pubchem);
  console.log(`→ ${targets.length} additifs sans Wikipédia à sonder via PubChem…`);

  const out = {};
  let done = 0, found = 0;
  for (const x of targets) {
    const q = encodeURIComponent(x.refs.pubchem);
    const cidData = await getJson(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${q}/cids/JSON`);
    const cid = cidData?.IdentifierList?.CID?.[0];
    if (cid) {
      const rec = await getJson(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=Record+Description`);
      const desc = rec ? firstDescription(rec) : null;
      if (desc) { out[x.slug] = { cid, en: desc.replace(/\s+/g, " ").trim() }; found++; }
    }
    if (++done % 25 === 0) console.log(`  … ${done}/${targets.length} (trouvés : ${found})`);
    await new Promise((r) => setTimeout(r, 200));
  }

  await writeFile(join(ROOT, "data", "pubchem-desc.en.json"), JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`✓ ${found} descriptions PubChem écrites dans data/pubchem-desc.en.json`);
}

main().catch((e) => { console.error("✗", e.message); process.exit(1); });
