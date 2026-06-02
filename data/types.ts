// Modèle de données Nutrivae.
// Volontairement descriptif et neutre : on documente, on ne juge pas.

export type Domain =
  | "alimentaire"
  | "cosmétique"
  | "ménager"
  | "pharmaceutique"
  | "chimique";

// État de compatibilité, formulé sans alarmisme.
export type CompatStatus = "oui" | "non" | "selon-origine" | "à-vérifier" | "sans-objet";

// Statut réglementaire — fait, pas un jugement de valeur.
export type RegulatoryStatus = "autorise" | "restreint" | "interdit";

// Niveau de controverse / avis scientifique.
export type ControversyLevel = "aucune" | "avis-en-cours" | "controverse";

// État physique courant — base du visuel illustré (hero).
export type PhysicalForm = "poudre" | "cristaux" | "liquide" | "pate" | "gaz" | "solide";

export interface Compatibility {
  vegan: CompatStatus;
  halal: CompatStatus;
  casher: CompatStatus;
  // Allergènes : texte court et factuel.
  allergenes: string;
}

// Niveau de risque signalé sur une ligne / sous-carte (surlignage à gauche).
// « warn » = point de vigilance ; « danger » = risque notable (cancérogénicité,
// interdiction, contre-indication forte, conflit avec d'autres substances).
export type RiskLevel = "warn" | "danger";

export interface RegulationRow {
  label: string;
  value: string;
  // Surligne la ligne si elle décrit un risque / une restriction notable.
  risk?: RiskLevel;
}

export interface ScienceNote {
  // Titre court de l'observation / étude / controverse.
  heading: string;
  // Corps factuel, sans conclusion militante.
  body: string;
  // Surligne la sous-carte si elle documente un risque.
  risk?: RiskLevel;
  // Motif court du surlignage, ex. « Cancérogénicité », « Allergène ».
  riskLabel?: string;
}

export interface Ingredient {
  slug: string;
  name: string;
  // Alias : E-number, INCI, CAS, noms communs.
  aliases: string[];
  domains: Domain[];
  // Famille fonctionnelle, ex. « Régulateur d'acidité ».
  family: string;
  // Étiquettes courtes affichées en tête (ex. « Additif alimentaire », « Acidifiant »).
  tags: string[];
  // Statut global, phrase neutre et discrète.
  status: string;
  // Résumé en une ligne pour la recherche.
  summary: string;

  // ── Mentions prioritaires (affichées en premier) ──
  regulatoryStatus: RegulatoryStatus;
  controversy: ControversyLevel;
  // Contre-indications / publics concernés. Vide = aucune connue.
  contraindications: string[];
  // Description en langage simple, grand public.
  plain: string;
  // État physique courant + libellé lisible.
  form: PhysicalForm;
  formLabel: string;
  // Bloc définition — encyclopédique.
  definition: string[];
  // Bloc composition / rôle.
  role: string[];
  foundIn: string[];
  // Bloc réglementation — fiche technique sobre.
  regulation: RegulationRow[];
  compatibility: Compatibility;
  // Bloc connaissance scientifique.
  science: ScienceState;
  related?: string[];

  // Identifiants pour relier aux bases publiques (enrichissement en direct).
  refs: ExternalRefs;
}

export interface ExternalRefs {
  // Nom de requête PubChem (NCBI) — structure, formule, masse molaire.
  pubchem?: string;
  // Titre de l'article Wikipédia francophone — extrait sourcé.
  wikipediaFr?: string;
  // Identifiant additif Open Food Facts, ex. « e330 » (lien profond).
  offAdditive?: string;
  // Référence INCI pour CosIng (base cosmétique UE).
  cosing?: string;
}

// Soit des notes documentées, soit une absence assumée de données.
export type ScienceState =
  | { kind: "documented"; notes: ScienceNote[] }
  | { kind: "none"; note: string };
