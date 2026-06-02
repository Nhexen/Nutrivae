import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { IngredientCard } from "@/components/IngredientCard";
import { getAllIngredients } from "@/lib/ingredients";
import { domainLabel } from "@/lib/domains";
import type { Domain, Ingredient, PhysicalForm, RegulatoryStatus } from "@/data/types";

export const metadata: Metadata = {
  title: "Ingrédients",
  description: "Annuaire filtrable des substances documentées dans Nutrivae.",
};

type Params = { domaine?: string; statut?: string; forme?: string };

const STATUT_LABEL: Record<RegulatoryStatus, string> = {
  autorise: "Autorisé",
  restreint: "Sous conditions",
  interdit: "Interdit",
};
const STATUT_DOT: Record<RegulatoryStatus, string> = {
  autorise: "bg-ok",
  restreint: "bg-warn",
  interdit: "bg-danger",
};
const FORME_LABEL: Record<PhysicalForm, string> = {
  poudre: "Poudre",
  cristaux: "Cristaux",
  liquide: "Liquide",
  pate: "Pâte",
  gaz: "Gaz",
  solide: "Solide",
  indetermine: "Forme indéterminée",
};

function countBy<T extends string>(items: Ingredient[], pick: (i: Ingredient) => T[]): Map<T, number> {
  const m = new Map<T, number>();
  for (const i of items) for (const v of pick(i)) m.set(v, (m.get(v) ?? 0) + 1);
  return m;
}

// Construit un href en (dé)activant une facette, en conservant les autres.
function toggleHref(current: Params, key: keyof Params, value: string): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(current)) if (v) next.set(k, v);
  if (current[key] === value) next.delete(key);
  else next.set(key, value);
  const qs = next.toString();
  return qs ? `/ingredients?${qs}` : "/ingredients";
}

function Chip({
  href,
  active,
  label,
  count,
  dot,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
  dot?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-pill border px-3.5 py-1.5 text-[0.84rem] font-semibold transition-all ${
        active
          ? "border-brand-deep bg-brand-deep text-white"
          : "border-line bg-surface text-body hover:-translate-y-0.5 hover:border-brand-sage hover:shadow-card"
      }`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {label}
      <span className={`text-[0.72rem] font-medium ${active ? "text-white/70" : "text-muted"}`}>{count}</span>
    </Link>
  );
}

export default async function IngredientsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const sp = await searchParams;
  const all = await getAllIngredients();

  const domaineCounts = countBy(all, (i) => i.domains);
  const statutCounts = countBy(all, (i) => [i.regulatoryStatus]);
  const formeCounts = countBy(all, (i) => [i.form]);

  const filtered = all.filter(
    (i) =>
      (!sp.domaine || i.domains.includes(sp.domaine as Domain)) &&
      (!sp.statut || i.regulatoryStatus === sp.statut) &&
      (!sp.forme || i.form === sp.forme),
  );

  const hasFilter = Boolean(sp.domaine || sp.statut || sp.forme);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader active="/ingredients" />
      <main className="mx-auto w-full max-w-doc flex-1 px-6 py-12 sm:px-10">
        <header className="max-w-2xl animate-rise">
          <p className="eyebrow mb-3">L&apos;annuaire</p>
          <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-brand-deep sm:text-[2.6rem]">
            {hasFilter ? `${filtered.length} entrée${filtered.length > 1 ? "s" : ""}` : "Toutes les entrées"}
          </h1>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-body">
            {all.length} substances documentées. Filtrez par domaine d&apos;usage, statut
            réglementaire ou état physique.
          </p>
        </header>

        {/* Facettes */}
        <div className="mt-8 space-y-4 rounded-card border border-line bg-surface p-5 shadow-card">
          <FacetRow title="Domaine d'usage">
            {[...domaineCounts.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([d, n]) => (
                <Chip key={d} href={toggleHref(sp, "domaine", d)} active={sp.domaine === d} label={domainLabel(d)} count={n} />
              ))}
          </FacetRow>

          <FacetRow title="Statut réglementaire">
            {(["autorise", "restreint", "interdit"] as RegulatoryStatus[])
              .filter((s) => statutCounts.get(s))
              .map((s) => (
                <Chip
                  key={s}
                  href={toggleHref(sp, "statut", s)}
                  active={sp.statut === s}
                  label={STATUT_LABEL[s]}
                  count={statutCounts.get(s) ?? 0}
                  dot={STATUT_DOT[s]}
                />
              ))}
          </FacetRow>

          <FacetRow title="État physique">
            {[...formeCounts.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([f, n]) => (
                <Chip key={f} href={toggleHref(sp, "forme", f)} active={sp.forme === f} label={FORME_LABEL[f]} count={n} />
              ))}
          </FacetRow>

          {hasFilter && (
            <Link href="/ingredients" className="inline-block text-[0.82rem] font-semibold text-brand-deep underline underline-offset-2">
              Réinitialiser les filtres
            </Link>
          )}
        </div>

        {/* Résultats */}
        {filtered.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ingredient) => (
              <IngredientCard key={ingredient.slug} ingredient={ingredient} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-[1rem] text-muted">
            Aucune entrée ne correspond à cette combinaison de filtres.
          </p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function FacetRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
      <span className="w-40 flex-none pt-1.5 text-[0.72rem] font-semibold uppercase tracking-label text-muted">
        {title}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
