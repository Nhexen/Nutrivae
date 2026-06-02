// Schéma SQL de la base Nutrivae.
// Les champs structurés (tableaux, objets) sont stockés en JSON (TEXT).
// Migration future vers Postgres : ces colonnes deviennent du `jsonb`.
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS ingredients (
  slug              TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  family            TEXT NOT NULL,
  status            TEXT NOT NULL,
  summary           TEXT NOT NULL,
  plain             TEXT NOT NULL,
  form              TEXT NOT NULL,
  form_label        TEXT NOT NULL,
  regulatory_status TEXT NOT NULL,
  controversy       TEXT NOT NULL,
  aliases           TEXT NOT NULL,
  domains           TEXT NOT NULL,
  tags              TEXT NOT NULL,
  found_in          TEXT NOT NULL,
  contraindications TEXT NOT NULL,
  definition        TEXT NOT NULL,
  definition_source TEXT,
  role              TEXT NOT NULL,
  regulation        TEXT NOT NULL,
  compatibility     TEXT NOT NULL,
  science           TEXT NOT NULL,
  refs              TEXT NOT NULL,
  related           TEXT NOT NULL
);
`;
