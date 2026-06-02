import type { ExternalRefs } from "@/data/types";

// Enrichissement en direct depuis des bases publiques.
// Tout est tolérant aux pannes : si une source ne répond pas, la page se rend quand même.

const DAY = 60 * 60 * 24;
const UA = "Nutrivae/0.1 (base de connaissance ouverte; contact@nutrivae.example)";

export interface PubChemData {
  cid: number;
  formula?: string;
  weight?: string;
  iupac?: string;
  smiles?: string;
  url: string;
  image2d: string;
}

export interface WikipediaData {
  extract: string;
  url: string;
  thumbnail?: string;
  wikidata?: string;
}

export interface ExternalData {
  pubchem?: PubChemData;
  wikipedia?: WikipediaData;
  fetchedAt: string;
}

async function fetchJson<T>(url: string, revalidate = DAY): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      next: { revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function getPubChem(name?: string): Promise<PubChemData | undefined> {
  if (!name) return undefined;
  const base = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound";
  const q = encodeURIComponent(name);

  const cidData = await fetchJson<{ IdentifierList?: { CID?: number[] } }>(
    `${base}/name/${q}/cids/JSON`,
  );
  const cid = cidData?.IdentifierList?.CID?.[0];
  if (!cid) return undefined;

  const props = await fetchJson<{
    PropertyTable?: { Properties?: Array<Record<string, string | number>> };
  }>(
    `${base}/cid/${cid}/property/MolecularFormula,MolecularWeight,IUPACName,ConnectivitySMILES,SMILES/JSON`,
  );
  const p = props?.PropertyTable?.Properties?.[0];

  return {
    cid,
    formula: p?.MolecularFormula ? String(p.MolecularFormula) : undefined,
    weight: p?.MolecularWeight ? String(p.MolecularWeight) : undefined,
    iupac: p?.IUPACName ? String(p.IUPACName) : undefined,
    smiles: (p?.ConnectivitySMILES ?? p?.SMILES) ? String(p?.ConnectivitySMILES ?? p?.SMILES) : undefined,
    url: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
    image2d: `${base}/cid/${cid}/PNG?image_size=320x320`,
  };
}

async function getWikipedia(title?: string): Promise<WikipediaData | undefined> {
  if (!title) return undefined;
  const data = await fetchJson<{
    extract?: string;
    content_urls?: { desktop?: { page?: string } };
    thumbnail?: { source?: string };
    wikibase_item?: string;
    type?: string;
  }>(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);

  if (!data?.extract || data.type === "disambiguation") return undefined;

  return {
    extract: data.extract,
    url: data.content_urls?.desktop?.page ?? `https://fr.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    thumbnail: data.thumbnail?.source,
    wikidata: data.wikibase_item,
  };
}

export async function getExternalData(refs: ExternalRefs): Promise<ExternalData> {
  const [pubchem, wikipedia] = await Promise.all([
    getPubChem(refs.pubchem),
    getWikipedia(refs.wikipediaFr),
  ]);
  return { pubchem, wikipedia, fetchedAt: new Date().toISOString() };
}
