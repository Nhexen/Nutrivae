import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { getAllIngredients } from "@/lib/ingredients";
import { domainLabel } from "@/lib/domains";
import type { Domain, Ingredient, PhysicalForm, RegulatoryStatus } from "@/data/types";

export const metadata: Metadata = {
  title: "Catégories",
  description: "Explorer les substances Nutrivae par domaine, statut réglementaire et état physique.",
};

const STATUT: Array<{ key: RegulatoryStatus; label: string; desc: string; tone: string; dot: string }> = [
  { key: "autorise", label: "Autorisé", desc: "Usage permis dans l'UE", tone: "text-[#0a7c54]", dot: "bg-ok" },
  { key: "restreint", label: "Sous conditions", desc: "Doses ou usages encadrés", tone: "text-[#b9750a]", dot: "bg-warn" },
  { key: "interdit", label: "Interdit", desc: "Non autorisé / retiré dans l'UE", tone: "text-[#c23434]", dot: "bg-danger" },
];

const FORME: Array<{ key: PhysicalForm; label: string }> = [
  { key: "poudre", label: "Poudre" },
  { key: "cristaux", label: "Cristaux" },
  { key: "liquide", label: "Liquide" },
  { key: "pate", label: "Pâte" },
  { key: "gaz", label: "Gaz" },
  { key: "solide", label: "Solide" },
  { key: "indetermine", label: "Forme indéterminée" },
];

function count(items: Ingredient[], pred: (i: Ingredient) => boolean): number {
  return items.filter(pred).length;
}

export default async function CategoriesPage() {
  const all = await getAllIngredients();
  const domains: Domain[] = ["alimentaire", "cosmétique", "ménager", "pharmaceutique", "chimique"];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader active="/categories" />
      <main className="mx-auto w-full max-w-doc flex-1 px-6 py-12 sm:px-10">
        <header className="max-w-2xl animate-rise">
          <p className="eyebrow mb-3">Explorer</p>
          <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-brand-deep sm:text-[2.6rem]">
            Catégories
          </h1>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-body">
            Trois manières de parcourir les {all.length} entrées : par domaine d&apos;usage,
            par statut réglementaire ou par état physique.
          </p>
        </header>

        {/* Statut réglementaire — mis en avant (cartes) */}
        <section className="mt-10">
          <h2 className="mb-4 text-[1.3rem] font-bold text-ink">Par statut réglementaire</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STATUT.map((s) => {
              const n = count(all, (i) => i.regulatoryStatus === s.key);
              return (
                <Link
                  key={s.key}
                  href={`/ingredients?statut=${s.key}`}
                  className="card group flex flex-col gap-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                    <span className={`text-[1.1rem] font-bold ${s.tone}`}>{s.label}</span>
                  </span>
                  <span className="text-[2rem] font-bold text-ink">{n}</span>
                  <span className="text-[0.85rem] text-muted">{s.desc}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Domaine d'usage */}
        <section className="mt-12">
          <h2 className="mb-4 text-[1.3rem] font-bold text-ink">Par domaine d&apos;usage</h2>
          <div className="flex flex-wrap gap-3">
            {domains
              .map((d) => ({ d, n: count(all, (i) => i.domains.includes(d)) }))
              .filter((x) => x.n > 0)
              .sort((a, b) => b.n - a.n)
              .map(({ d, n }) => (
                <Link
                  key={d}
                  href={`/ingredients?domaine=${encodeURIComponent(d)}`}
                  className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-4 py-2.5 text-[0.9rem] font-semibold text-brand-deep shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-sage hover:shadow-lift"
                >
                  {domainLabel(d)}
                  <span className="rounded-pill bg-brand-cream px-2 py-0.5 text-[0.72rem] text-muted">{n}</span>
                </Link>
              ))}
          </div>
        </section>

        {/* État physique */}
        <section className="mt-12">
          <h2 className="mb-4 text-[1.3rem] font-bold text-ink">Par état physique</h2>
          <div className="flex flex-wrap gap-3">
            {FORME.map((f) => ({ f, n: count(all, (i) => i.form === f.key) }))
              .filter((x) => x.n > 0)
              .sort((a, b) => b.n - a.n)
              .map(({ f, n }) => (
                <Link
                  key={f.key}
                  href={`/ingredients?forme=${f.key}`}
                  className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-4 py-2.5 text-[0.9rem] font-semibold text-brand-deep shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-sage hover:shadow-lift"
                >
                  {f.label}
                  <span className="rounded-pill bg-brand-cream px-2 py-0.5 text-[0.72rem] text-muted">{n}</span>
                </Link>
              ))}
          </div>
        </section>

        <div className="mt-14 rounded-card bg-brand-deep p-8 text-center sm:p-10">
          <p className="text-[1.3rem] font-bold text-white">Une substance précise en tête ?</p>
          <p className="mx-auto mt-2 max-w-md text-[0.95rem] text-white/75">
            La recherche accepte les noms, les codes E et les dénominations INCI.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-pill bg-white px-6 py-3 text-[0.9rem] font-semibold text-brand-deep transition-transform hover:-translate-y-0.5"
          >
            Lancer une recherche
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
