import type { Domain } from "@/data/types";

// Module pur (sans dépendance à la base) : utilisable côté client comme serveur.
const DOMAIN_LABELS: Record<Domain, string> = {
  alimentaire: "Alimentaire",
  cosmétique: "Cosmétique",
  ménager: "Ménager",
  pharmaceutique: "Pharmaceutique",
  chimique: "Chimique",
};

export function domainLabel(domain: Domain): string {
  return DOMAIN_LABELS[domain];
}
