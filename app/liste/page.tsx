import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { getAllIngredients } from "@/lib/ingredients";
import type { Ingredient, RegulatoryStatus } from "@/data/types";

export const metadata: Metadata = {
  title: "Liste des additifs E",
  description: "La liste complète et lisible des additifs alimentaires (E-numbers), classés par série et par statut réglementaire.",
};

const STATUT: Record<RegulatoryStatus, { label: string; dot: string; text: string }> = {
  autorise: { label: "Autorisé", dot: "bg-ok", text: "text-[#0a7c54]" },
  restreint: { label: "Sous conditions", dot: "bg-warn", text: "text-[#b9750a]" },
  interdit: { label: "Interdit", dot: "bg-danger", text: "text-[#c23434]" },
};

const SERIES = [
  { min: 100, max: 199, title: "Colorants", range: "E100–E199" },
  { min: 200, max: 299, title: "Conservateurs", range: "E200–E299" },
  { min: 300, max: 399, title: "Antioxydants & régulateurs d'acidité", range: "E300–E399" },
  { min: 400, max: 499, title: "Agents de texture", range: "E400–E499" },
  { min: 500, max: 599, title: "Régulateurs d'acidité & antiagglomérants", range: "E500–E599" },
  { min: 600, max: 699, title: "Exhausteurs de goût", range: "E600–E699" },
  { min: 700, max: 899, title: "Divers", range: "E700–E899" },
  { min: 900, max: 999, title: "Enrobage, gaz & édulcorants", range: "E900–E999" },
  { min: 1000, max: 1599, title: "Additifs divers", range: "E1000+" },
];

function eNumber(i: Ingredient): number | null {
  const m = i.aliases[0]?.match(/^E(\d+)/i);
  return m ? Number(m[1]) : null;
}

export default async function ListePage() {
  const all = await getAllIngredients();

  // Uniquement les entrées disposant d'un code E, ordonnées.
  const withE = all
    .map((i) => ({ i, n: eNumber(i) }))
    .filter((x): x is { i: Ingredient; n: number } => x.n !== null)
    .sort((a, b) => a.n - b.n || a.i.aliases[0].localeCompare(b.i.aliases[0]));

  const groups = SERIES.map((s) => ({
    ...s,
    items: withE.filter((x) => x.n >= s.min && x.n <= s.max).map((x) => x.i),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader active="/liste" />
      <main className="mx-auto w-full max-w-doc flex-1 px-6 py-12 sm:px-10">
        <header className="max-w-2xl animate-rise">
          <p className="eyebrow mb-3">Référence</p>
          <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-brand-deep sm:text-[2.6rem]">
            Liste des additifs E
          </h1>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-body">
            {withE.length} additifs alimentaires classés par série et par fonction.
            La pastille indique le statut réglementaire dans l&apos;Union européenne.
          </p>
          {/* Légende */}
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[0.8rem] text-body">
            {(Object.keys(STATUT) as RegulatoryStatus[]).map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${STATUT[s].dot}`} />
                {STATUT[s].label}
              </span>
            ))}
          </div>
        </header>

        {/* Navigation par série */}
        <nav className="sticky top-[57px] z-10 -mx-6 mt-8 border-y border-line bg-brand-cream/90 px-6 py-3 backdrop-blur-md sm:-mx-10 sm:px-10">
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <a
                key={g.range}
                href={`#${g.range}`}
                className="rounded-pill border border-line bg-surface px-3 py-1 text-[0.76rem] font-semibold text-brand-deep transition-colors hover:border-brand-sage"
              >
                {g.range} <span className="text-muted">{g.items.length}</span>
              </a>
            ))}
          </div>
        </nav>

        {/* Séries */}
        <div className="mt-10 flex flex-col gap-12">
          {groups.map((g) => (
            <section key={g.range} id={g.range} className="scroll-mt-32">
              <div className="mb-4 flex items-baseline gap-3 border-b border-line pb-2">
                <h2 className="text-[1.25rem] font-bold text-ink">{g.title}</h2>
                <span className="font-mono text-[0.8rem] text-muted">{g.range}</span>
                <span className="ml-auto text-[0.8rem] text-muted">{g.items.length} entrées</span>
              </div>

              <ul className="divide-y divide-line">
                {g.items.map((i) => (
                  <li key={i.slug}>
                    <Link
                      href={`/ingredient/${i.slug}`}
                      className="group flex items-center gap-3 py-2.5 transition-colors hover:bg-surface sm:gap-4"
                    >
                      <span className="w-16 flex-none rounded-md bg-brand-cream px-2 py-1 text-center font-mono text-[0.78rem] font-semibold text-brand-deep ring-1 ring-inset ring-line">
                        {i.aliases[0]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-ink group-hover:text-brand-deep">
                          {i.name}
                        </span>
                        <span className="block truncate text-[0.8rem] text-muted">{i.family}</span>
                      </span>
                      <span
                        className={`hidden items-center gap-1.5 text-[0.78rem] font-semibold sm:inline-flex ${STATUT[i.regulatoryStatus].text}`}
                        title={STATUT[i.regulatoryStatus].label}
                      >
                        <span className={`h-2 w-2 rounded-full ${STATUT[i.regulatoryStatus].dot}`} />
                        {STATUT[i.regulatoryStatus].label}
                      </span>
                      <span
                        className={`h-2.5 w-2.5 flex-none rounded-full sm:hidden ${STATUT[i.regulatoryStatus].dot}`}
                        title={STATUT[i.regulatoryStatus].label}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
