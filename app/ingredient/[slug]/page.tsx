import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Logo, LogoMark } from "@/components/Logo";
import { Accordion } from "@/components/Accordion";
import { ChemicalIdentityCard } from "@/components/ChemicalIdentityCard";
import { SiteFooter } from "@/components/SiteHeader";
import { HexField, SubstanceFrame } from "@/components/Signature";
import { getExternalData } from "@/lib/external";
import {
  Badge,
  CompatibilityBadges,
  ControversyBadge,
  RegulatoryBadge,
} from "@/components/StatusBadges";
import {
  AlertTriangle,
  BookOpen,
  Check,
  Eye,
  FlaskConical,
  Leaf,
  Pin,
  Scale,
  Share,
  ShieldCheck,
} from "@/components/icons";
import { domainLabel, getIngredientBySlug, getRelated } from "@/lib/ingredients";
import { ingredients as curatedFixture } from "@/data/ingredients";

// Les fiches non pré-générées sont rendues à la demande (ISR) au premier accès.
export const dynamicParams = true;

// On ne pré-génère au build que les entrées curatées (les autres feraient
// autant d'appels PubChem/Wikipédia — rendu à la demande, mis en cache).
export function generateStaticParams() {
  return curatedFixture.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ingredient = await getIngredientBySlug(slug);
  if (!ingredient) return { title: "Entrée introuvable" };
  return { title: ingredient.name, description: ingredient.plain };
}

// Surlignage de risque (bord gauche), jaune (vigilance) ou rouge (risque notable).
const RISK_ROW: Record<"warn" | "danger", string> = {
  warn: "border-l-[3px] border-warn bg-warn-soft/50 pl-3 sm:pl-4",
  danger: "border-l-[3px] border-danger bg-danger-soft/50 pl-3 sm:pl-4",
};
const RISK_CARD: Record<"warn" | "danger", string> = {
  warn: "border-l-4 border-warn bg-warn-soft/50",
  danger: "border-l-4 border-danger bg-danger-soft/50",
};
const RISK_TONE: Record<"warn" | "danger", string> = {
  warn: "text-[#b9750a]",
  danger: "text-[#c23434]",
};

function SourceLink({
  href,
  name,
  desc,
  live = false,
}: {
  href: string;
  name: string;
  desc: string;
  live?: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-brand-sage hover:shadow-card"
      >
        <span className="flex-1">
          <span className="flex items-center gap-2">
            <span className="font-bold text-ink">{name}</span>
            {live && (
              <span className="inline-flex items-center gap-1 rounded-pill bg-ok-soft px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-label text-[#0a7c54]">
                <span className="h-1 w-1 rounded-full bg-ok" /> live
              </span>
            )}
          </span>
          <span className="block text-[0.78rem] text-muted">{desc}</span>
        </span>
        <span className="text-faint transition-colors group-hover:text-brand-deep">↗</span>
      </a>
    </li>
  );
}

const NAV = [
  ["resume", "Résumé"],
  ["identite", "Identité chimique"],
  ["usages", "Usages & rôle"],
  ["reglementation", "Réglementation"],
  ["compatibilite", "Compatibilité"],
  ["controverses", "Controverses"],
  ["sources", "Sources"],
] as const;

export default async function IngredientPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ingredient = await getIngredientBySlug(slug);
  if (!ingredient) notFound();

  const related = await getRelated(ingredient);
  const hasContra = ingredient.contraindications.length > 0;
  const external = await getExternalData(ingredient.refs);

  return (
    <div className="min-h-screen">
      {/* En-tête */}
      <header className="sticky top-0 z-30 border-b border-line bg-brand-cream/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-doc items-center justify-between px-6 py-3.5 sm:px-10">
          <Logo small />
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-1.5 text-[0.82rem] text-muted sm:flex">
              <Link href="/" className="transition-colors hover:text-brand-deep">Accueil</Link>
              <span className="text-faint">/</span>
              <Link href="/ingredients" className="transition-colors hover:text-brand-deep">Ingrédients</Link>
              <span className="text-faint">/</span>
              <span className="font-semibold text-brand-deep">{ingredient.aliases[0]}</span>
            </nav>
            <button className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-[0.8rem] font-semibold text-body transition-colors hover:border-brand-sage">
              <Share className="h-4 w-4" /> Partager
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-doc px-6 pb-24 pt-8 sm:px-10">
        {/* ── HERO ── */}
        <section className="card animate-rise relative overflow-hidden">
          <HexField className="pointer-events-none absolute right-0 top-0 h-72 w-72 text-brand-deep/[0.04]" />
          <div className="relative grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              {/* Tags */}
              <div className="mb-4 flex flex-wrap gap-2">
                {ingredient.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-pill bg-brand-cream px-3 py-1 text-[0.74rem] font-semibold text-brand-slate ring-1 ring-inset ring-line"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Titre + alias */}
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="text-[2.3rem] font-bold leading-none tracking-tight text-brand-deep sm:text-[2.8rem]">
                  {ingredient.name}
                </h1>
                <span className="text-[1.1rem] font-bold text-ok">{ingredient.aliases[0]}</span>
              </div>
              <p className="mt-1.5 text-[0.84rem] font-medium text-muted">
                {ingredient.aliases.slice(1).join("  ·  ")}
              </p>

              {/* Description simple */}
              <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-body">
                {ingredient.plain}
              </p>
            </div>

            {/* Représentation illustrée de l'état physique (signature hexagonale) */}
            <div className="hidden justify-self-end lg:block">
              <SubstanceFrame form={ingredient.form} label={ingredient.formLabel} size={140} />
            </div>
          </div>

          {/* ── BARRE DE STATUT PRIORITAIRE ── */}
          <div className="border-t border-line bg-brand-cream/50 p-6 sm:p-8">
            <p className="eyebrow mb-3">En un coup d'œil</p>
            <div className="flex flex-wrap items-center gap-2.5">
              <RegulatoryBadge status={ingredient.regulatoryStatus} />
              <ControversyBadge level={ingredient.controversy} />
            </div>

            <div className="mt-4">
              <CompatibilityBadges compatibility={ingredient.compatibility} />
            </div>

            {/* Contre-indications */}
            <div className="mt-4">
              {hasContra ? (
                <div className="flex items-start gap-3 rounded-2xl bg-danger-soft p-4 ring-1 ring-inset ring-danger/20">
                  <span className="mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-full bg-white/70 text-[#c23434]">
                    <AlertTriangle />
                  </span>
                  <div>
                    <p className="text-[0.86rem] font-bold text-[#c23434]">
                      Contre-indications & précautions
                    </p>
                    <ul className="mt-1 space-y-0.5 text-[0.9rem] text-body">
                      {ingredient.contraindications.map((c) => (
                        <li key={c}>— {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-2xl bg-ok-soft px-4 py-2.5 text-[0.88rem] font-semibold text-[#0a7c54] ring-1 ring-inset ring-ok/20">
                  <Check /> Aucune contre-indication connue
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── CORPS : nav + sections ── */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
          {/* Mini-nav latérale */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24">
              <p className="eyebrow mb-3">Sommaire</p>
              <ul className="space-y-1">
                {NAV.map(([anchor, label]) => (
                  <li key={anchor}>
                    <a
                      href={`#${anchor}`}
                      className="block rounded-xl px-3 py-2 text-[0.9rem] font-medium text-body transition-colors hover:bg-surface hover:text-brand-deep"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Sections */}
          <div className="flex flex-col gap-4">
            <section id="resume" className="card scroll-mt-24 p-6">
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-ok-soft text-[#0a7c54]">
                  <BookOpen />
                </span>
                <h2 className="text-[1.15rem] font-bold text-ink">Résumé</h2>
              </div>
              {ingredient.definition.map((para, i) => (
                <p key={i} className={`text-[1rem] leading-relaxed text-body ${i > 0 ? "mt-3" : ""}`}>
                  {para}
                </p>
              ))}

              {ingredient.definitionSource === "wikipedia" && (
                <a
                  href={external.wikipedia?.url ?? `https://fr.wikipedia.org/wiki/${encodeURIComponent(ingredient.refs.wikipediaFr ?? ingredient.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[0.74rem] font-medium text-muted hover:text-brand-deep"
                >
                  Définition d&apos;après Wikipédia (CC BY-SA) ↗
                </a>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {ingredient.domains.map((d) => (
                  <span key={d} className="inline-flex items-center gap-1.5 rounded-pill bg-info-soft px-3 py-1 text-[0.76rem] font-semibold text-[#2a63c4]">
                    <Leaf className="h-3.5 w-3.5" /> {domainLabel(d)}
                  </span>
                ))}
              </div>
            </section>

            {/* ── Carte d'identité chimique (signature, données live) ── */}
            <div id="identite" className="scroll-mt-24">
              <ChemicalIdentityCard name={ingredient.name} pubchem={external.pubchem} />
            </div>

            <Accordion icon={<FlaskConical />} title="Usages & rôle" meta={ingredient.family}>
              {ingredient.role.map((para, i) => (
                <p key={i} className={`text-[0.98rem] leading-relaxed text-body ${i > 0 ? "mt-3" : ""}`}>
                  {para}
                </p>
              ))}
              <p className="eyebrow mb-2 mt-5">Où le trouve-t-on</p>
              <div className="flex flex-wrap gap-2">
                {ingredient.foundIn.map((place) => (
                  <span key={place} className="inline-flex items-center gap-1.5 rounded-pill bg-brand-cream px-3 py-1.5 text-[0.82rem] text-body ring-1 ring-inset ring-line">
                    <Pin className="h-3.5 w-3.5 text-brand-sage" /> {place}
                  </span>
                ))}
              </div>
            </Accordion>

            <Accordion icon={<Scale />} title="Réglementation" meta="Union européenne — indicatif">
              <dl className="divide-y divide-line">
                {ingredient.regulation.map((row) => (
                  <div
                    key={row.label}
                    className={`grid grid-cols-1 gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-5 ${
                      row.risk ? `rounded-r-lg ${RISK_ROW[row.risk]}` : ""
                    }`}
                  >
                    <dt className="flex items-center gap-1.5 text-[0.82rem] font-semibold text-muted">
                      {row.risk && (
                        <span className={`text-[0.7rem] ${RISK_TONE[row.risk]}`} aria-hidden>
                          ●
                        </span>
                      )}
                      {row.label}
                    </dt>
                    <dd className="text-[0.92rem] font-medium text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </Accordion>

            <Accordion icon={<ShieldCheck />} title="Compatibilité" meta="Régimes & allergènes">
              <CompatibilityBadges compatibility={ingredient.compatibility} />
              <div className="mt-4 flex items-start gap-3 rounded-2xl bg-brand-cream p-4">
                <span className="mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-full bg-white text-brand-slate ring-1 ring-inset ring-line">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <p className="text-[0.9rem] leading-relaxed text-body">
                  <span className="font-semibold text-ink">Allergènes — </span>
                  {ingredient.compatibility.allergenes}
                </p>
              </div>
            </Accordion>

            <Accordion
              icon={<Eye />}
              title="Controverses & avis scientifique"
              meta={
                ingredient.controversy === "aucune"
                  ? "Aucune controverse majeure"
                  : ingredient.controversy === "avis-en-cours"
                    ? "Avis scientifique en cours"
                    : "Sujet à controverse"
              }
            >
              {ingredient.science.kind === "none" ? (
                <p className="text-[0.96rem] italic leading-relaxed text-muted">
                  {ingredient.science.note}
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {ingredient.science.notes.map((note) => (
                    <div
                      key={note.heading}
                      className={`rounded-2xl p-4 ${note.risk ? RISK_CARD[note.risk] : "bg-brand-cream"}`}
                    >
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-ink">{note.heading}</h3>
                        {note.risk && note.riskLabel && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-pill bg-white/70 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-label ${RISK_TONE[note.risk]}`}
                          >
                            {note.risk === "danger" ? "▲" : "●"} {note.riskLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-[0.94rem] leading-relaxed text-body">{note.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </Accordion>

            <Accordion icon={<BookOpen />} title="Sources & bases publiques" meta="Liens vérifiables">
              <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {external.pubchem && (
                  <SourceLink
                    href={external.pubchem.url}
                    name="PubChem — NCBI"
                    desc={`Fiche chimique · CID ${external.pubchem.cid}`}
                    live
                  />
                )}
                {external.wikipedia && (
                  <SourceLink
                    href={external.wikipedia.url}
                    name="Wikipédia (FR)"
                    desc="Article encyclopédique"
                    live
                  />
                )}
                <SourceLink
                  href="https://www.efsa.europa.eu/fr/publications"
                  name="EFSA"
                  desc="Évaluations de sécurité (UE)"
                />
                {ingredient.refs.offAdditive && (
                  <SourceLink
                    href={`https://world.openfoodfacts.org/additive/${ingredient.refs.offAdditive}`}
                    name="Open Food Facts"
                    desc={`Additif ${ingredient.aliases[0]}`}
                  />
                )}
                {ingredient.refs.cosing && (
                  <SourceLink
                    href={`https://ec.europa.eu/growth/tools-databases/cosing/index.cfm?fuseaction=search.simple&search=${encodeURIComponent(ingredient.refs.cosing)}`}
                    name="CosIng (UE)"
                    desc="Référentiel cosmétique INCI"
                  />
                )}
                {(ingredient.refs.wikidata ?? external.wikipedia?.wikidata) && (
                  <SourceLink
                    href={`https://www.wikidata.org/wiki/${ingredient.refs.wikidata ?? external.wikipedia?.wikidata}`}
                    name="Wikidata"
                    desc={ingredient.refs.wikidata ?? external.wikipedia?.wikidata ?? ""}
                  />
                )}
              </ul>
              <p className="mt-4 text-[0.78rem] italic text-muted">
                Les liens « en direct » sont résolus automatiquement depuis les bases
                publiques ; les autres pointent vers le portail officiel de référence.
              </p>
            </Accordion>

            {/* Entrées liées */}
            {related.length > 0 && (
              <section className="card scroll-mt-24 p-6">
                <p className="eyebrow mb-3">Entrées liées</p>
                <div className="flex flex-wrap gap-3">
                  {related.map((rel) => (
                    <Link
                      key={rel.slug}
                      href={`/ingredient/${rel.slug}`}
                      className="group flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-brand-sage hover:shadow-card"
                    >
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-ok-soft text-brand-deep">
                        <LogoMark className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block font-bold text-ink">{rel.name}</span>
                        <span className="block text-[0.78rem] font-semibold text-ok">{rel.aliases[0]}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
