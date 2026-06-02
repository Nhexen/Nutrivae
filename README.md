# Nutrivae

> Lire ce qui est invisible dans les produits du quotidien.

Base de connaissance ouverte sur les substances et ingrédients de
l'alimentation (additifs, E-numbers), des cosmétiques (INCI), des produits
ménagers et des substances pharmaceutiques.

**Positionnement.** On documente, on ne juge pas. Pas de classement « bon /
mauvais », pas de discours militant — uniquement de la donnée structurée,
contextualisée et lisible.

## Direction artistique

Identité chaleureuse, claire et scannable, conforme à la DA Nutrivae. Les
mentions importantes sont mises en avant ; les badges colorés expriment des
**faits** (statut réglementaire, controverse, compatibilité), jamais un jugement.

- **Typographie** — Plus Jakarta Sans (400 → 700).
- **Couleurs** — palette de marque : vert profond `#0F3D2E`, vert sauge
  `#A8C5B2`, bleu-gris `#6B7C93`, blanc cassé `#FAFAF7`. Accents sémantiques :
  vert (ok/autorisé), orange (sous conditions / avis en cours), rouge (interdit /
  contre-indication), bleu (information).
- **Layout** — cartes à coins doux, ombres légères, hero avec **barre de statut
  prioritaire** puis sections en accordéon (divulgation progressive).
- **Logo** — hexagone + pousse (SVG, `components/Logo.tsx`).
- **Interaction** — transitions légères, `prefers-reduced-motion` respecté.

## Données & sources publiques

Chaque fiche est **enrichie en direct** depuis des bases publiques, côté serveur,
avec cache (ISR, revalidation 24 h) et tolérance aux pannes (la page se rend
toujours, même source indisponible) — voir [lib/external.ts](lib/external.ts).

- **PubChem (NCBI)** — structure moléculaire 2D, formule brute, masse molaire,
  nom IUPAC, SMILES, identifiant CID.
- **Wikipédia (FR)** — extrait encyclopédique sourcé + identifiant Wikidata.
- **Liens d'autorité** — EFSA, Open Food Facts (additif), CosIng (INCI/UE),
  Wikidata, résolus par les identifiants de [data/ingredients.ts](data/ingredients.ts).

La **signature visuelle** unique en découle : la structure moléculaire réelle est
cadrée dans un **hexagone** (écho du logo), présentée dans une « carte d'identité
chimique » de type fiche de laboratoire, sur un **motif hexagonal** discret —
[components/Signature.tsx](components/Signature.tsx),
[components/ChemicalIdentityCard.tsx](components/ChemicalIdentityCard.tsx).

## Ingestion (V2 / V3 — additifs alimentaires)

Le catalogue est enrichi par **ingestion automatisée** depuis la taxonomie
**Open Food Facts** :

```bash
npm run ingest:additives   # → data/additives.generated.json (versionné)
```

- ~466 additifs E (nom FR, fonction, compatibilité vegan, Wikidata, EFSA),
  conformes au type `Ingredient`. Fichier **JSON versionné** (pas de binaire).
- **V3 — définitions étoffées** : extraits **Wikipédia FR** récupérés en lot via
  l'API MediaWiki (redirections suivies), ~294/466 enrichis, avec attribution
  CC BY-SA. Repli honnête (« notice en cours ») pour le reste.
- **V3 — statuts réglementaires curatés** : interdits (E171, E128, E216/217,
  E240, E924…) et restreints (E123, nitrites/nitrates E249–252, E425…) avec
  motif et surlignage de risque. États physiques curatés pour les cas connus.
- Les E-numbers déjà curatés à la main (E330, E951, E211, E422, E322) priment.
- Au seed, la couche DB **fusionne** additifs ingérés + entrées curatées.
- Pré-rendu au build limité aux entrées curatées ; les autres fiches en **ISR**.

## Catégorisation & liste

- **`/liste`** — la **liste complète et lisible des additifs E** (~471), classés par
  série (colorants, conservateurs, antioxydants…) avec pastille de statut UE.
- `/categories` — hub : par **statut réglementaire** (autorisé / sous conditions /
  interdit), par **domaine d'usage**, par **état physique**, avec compteurs.
- `/ingredients?statut=…&domaine=…&forme=…` — annuaire **filtrable par facettes**.

## Architecture des données (V1.1)

L'accès aux substances passe par une **couche repository asynchrone** au-dessus
d'un moteur **SQL** — point de bascule unique vers une base persistante (Postgres)
sans toucher aux pages.

```
Page (server) ─▶ lib/ingredients (façade) ─▶ lib/db/repository ─▶ node:sqlite
                                                                     ▲
                                          seed depuis data/ingredients.ts
```

- **`lib/db/`** — `schema.ts` (DDL), `client.ts` (moteur `node:sqlite`, natif Node ≥ 22,
  zéro dépendance), `repository.ts` (requêtes async → `Ingredient`).
- **Stockage V1.1** — SQLite en mémoire, ensemencé depuis `data/ingredients.ts`.
  Fichier persistant possible via `NUTRIVAE_DB=db/nutrivae.db` (process unique).
- **Recherche** — `lib/search.ts` (pur, sans dépendance DB) : le serveur passe un
  index léger au composant client pour une recherche instantanée (volumes V1/V2).

## Stack

- [Next.js 16](https://nextjs.org/) — App Router, génération statique (SSG)
- TypeScript
- Tailwind CSS (usage minimaliste, sans bibliothèque de composants)
- Données mock JSON typées (7 entrées)

## Structure

```
app/
  layout.tsx                 Police + métadonnées globales
  page.tsx                   Accueil — recherche + piliers
  ingredient/[slug]/page.tsx Fiche ingrédient (statut prioritaire + accordéons)
  not-found.tsx              404 cohérente avec l'identité
  globals.css                Base + utilitaires (.card, .eyebrow)
components/
  Logo.tsx                   Marque hexagone + pousse (SVG)
  SearchField.tsx            Recherche live (client) + navigation clavier
  StatusBadges.tsx           Badges réglementaire / controverse / compatibilité
  Accordion.tsx              Section dépliable (<details> natif)
  icons.tsx                  Jeu d'icônes au trait
data/
  types.ts                   Modèle de données
  ingredients.ts             Dataset mock (7 substances)
lib/
  ingredients.ts             Accès + recherche tolérante (accents, alias)
```

## Données V1

Acide citrique (E330), Aspartame (E951), Benzoate de sodium (E211),
Glycérine (E422), Lécithine (E322), Citric Acid (INCI), Sodium Lauryl Sulfate.

> Les valeurs réglementaires de cette V1 sont indicatives et destinées à la
> démonstration.

## Démarrage

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production (SSG)
```

## Pistes d'évolution

API publique, scan de codes-barres / OCR d'étiquettes, extension navigateur,
sources scientifiques référencées et versionnées.
