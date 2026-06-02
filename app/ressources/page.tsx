import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Ressources",
  description: "Comment lire une fiche Nutrivae et quelles bases de données publiques l'alimentent.",
};

const READING_STEPS = [
  {
    num: "01",
    title: "En un coup d'œil",
    text: "En tête de fiche, l'essentiel d'abord : statut réglementaire (autorisé, sous conditions ou interdit), présence d'une controverse, compatibilité vegan / halal / casher, et contre-indications éventuelles. De quoi se faire une idée en quelques secondes.",
  },
  {
    num: "02",
    title: "Carte d'identité chimique",
    text: "La structure moléculaire et les données physico-chimiques réelles (formule, masse molaire, nom IUPAC, SMILES, identifiant CID), récupérées en direct depuis PubChem. Le visuel du hero illustre, lui, l'état physique courant de la substance.",
  },
  {
    num: "03",
    title: "Repères de vigilance",
    text: "Dans les sections Réglementation et Controverses, une ligne ou une carte surlignée d'un trait à gauche signale un point d'attention : jaune pour une vigilance (allergène, restriction, sensibilité), rouge pour un risque notable (cancérogénicité, interdiction, contre-indication forte).",
  },
  {
    num: "04",
    title: "Sections à déplier",
    text: "Usages, réglementation détaillée, compatibilité, controverses et sources sont repliés par défaut : vous ouvrez uniquement ce qui vous intéresse. Chaque affirmation renvoie autant que possible à sa source publique.",
  },
];

const SOURCES = [
  {
    name: "PubChem — NCBI",
    org: "National Institutes of Health (États-Unis)",
    desc: "Structures moléculaires 2D, formules brutes, masses molaires, identifiants CID. Interrogé en direct pour chaque fiche.",
    href: "https://pubchem.ncbi.nlm.nih.gov/",
    live: true,
  },
  {
    name: "Wikipédia (FR)",
    org: "Wikimedia Foundation",
    desc: "Extraits encyclopédiques sourcés et liens vers Wikidata, via l'API REST de résumé.",
    href: "https://fr.wikipedia.org/",
    live: true,
  },
  {
    name: "EFSA",
    org: "Autorité européenne de sécurité des aliments",
    desc: "Évaluations de sécurité des additifs et doses journalières admissibles dans l'Union européenne.",
    href: "https://www.efsa.europa.eu/fr",
  },
  {
    name: "Open Food Facts",
    org: "Association à but non lucratif",
    desc: "Base ouverte et collaborative des produits alimentaires et de leurs additifs.",
    href: "https://world.openfoodfacts.org/",
  },
  {
    name: "CosIng",
    org: "Commission européenne",
    desc: "Référentiel officiel des ingrédients cosmétiques et de leur dénomination INCI.",
    href: "https://ec.europa.eu/growth/tools-databases/cosing/",
  },
  {
    name: "ANSES",
    org: "Agence française de sécurité sanitaire",
    desc: "Avis et expertises nationales sur l'alimentation, l'environnement et le travail.",
    href: "https://www.anses.fr/fr",
  },
];

export default function ResourcesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader active="/ressources" />
      <main className="mx-auto w-full max-w-doc flex-1 px-6 py-12 sm:px-10">
        <header className="max-w-2xl animate-rise">
          <p className="eyebrow mb-3">Mode d'emploi & méthodologie</p>
          <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-brand-deep sm:text-[2.6rem]">
            Bien lire une fiche
          </h1>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-body">
            Chaque fiche suit la même structure, des mentions essentielles jusqu'au
            détail scientifique. Voici comment la parcourir et d'où viennent nos données.
          </p>
        </header>

        {/* Comment lire une fiche — en premier, détaillé */}
        <section className="mt-10">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {READING_STEPS.map((step) => (
              <div key={step.num} className="card flex gap-4 p-6">
                <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-ok-soft text-[1.05rem] font-bold text-[#0a7c54]">
                  {step.num}
                </span>
                <div>
                  <h2 className="font-bold text-ink">{step.title}</h2>
                  <p className="mt-1.5 text-[0.92rem] leading-relaxed text-body">{step.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Légende des repères de vigilance */}
          <div className="mt-5 flex flex-col gap-3 rounded-card border border-line bg-brand-cream p-5 sm:flex-row sm:items-center sm:gap-8">
            <span className="eyebrow">Repères de vigilance</span>
            <span className="flex items-center gap-2 text-[0.88rem] text-body">
              <span className="h-5 w-1.5 rounded-full bg-warn" /> Jaune — point de vigilance
              (allergène, restriction, sensibilité)
            </span>
            <span className="flex items-center gap-2 text-[0.88rem] text-body">
              <span className="h-5 w-1.5 rounded-full bg-danger" /> Rouge — risque notable
              (cancérogénicité, interdiction, contre-indication)
            </span>
          </div>
        </section>

        {/* Nos sources */}
        <section className="mt-16">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-[1.6rem] font-bold text-ink">Nos sources</h2>
            <p className="mt-2 text-[0.98rem] leading-relaxed text-body">
              Nutrivae s'appuie sur des bases de données publiques et des autorités
              reconnues. Les sources marquées « en direct » sont interrogées
              automatiquement à chaque consultation de fiche.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {SOURCES.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="card group flex flex-col gap-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-[1.1rem] font-bold text-ink">{s.name}</h3>
                  {s.live && (
                    <span className="inline-flex items-center gap-1 rounded-pill bg-ok-soft px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-label text-[#0a7c54]">
                      <span className="h-1 w-1 rounded-full bg-ok" /> live
                    </span>
                  )}
                  <span className="ml-auto text-faint transition-colors group-hover:text-brand-deep">↗</span>
                </div>
                <p className="text-[0.78rem] font-semibold uppercase tracking-label text-muted">{s.org}</p>
                <p className="mt-1 text-[0.92rem] leading-relaxed text-body">{s.desc}</p>
              </a>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
