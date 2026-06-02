import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { IngredientCard } from "@/components/IngredientCard";
import { getAllIngredients, domainLabel } from "@/lib/ingredients";
import type { Domain } from "@/data/types";

export const metadata: Metadata = {
  title: "Catégories",
  description: "Explorer les substances Nutrivae par domaine d'usage.",
};

const DOMAIN_ORDER: Domain[] = ["alimentaire", "cosmétique", "ménager", "pharmaceutique", "chimique"];

const DOMAIN_DESC: Record<Domain, string> = {
  alimentaire: "Additifs et ingrédients des aliments et boissons (numérotation E).",
  cosmétique: "Ingrédients des soins et de l'hygiène (dénomination INCI).",
  ménager: "Substances des produits d'entretien et de nettoyage.",
  pharmaceutique: "Excipients et substances des médicaments du quotidien.",
  chimique: "Composés chimiques transverses aux usages courants.",
};

export default async function CategoriesPage() {
  const all = await getAllIngredients();
  const byDomain = DOMAIN_ORDER.map((domain) => ({
    domain,
    items: all.filter((i) => i.domains.includes(domain)),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader active="/categories" />
      <main className="mx-auto w-full max-w-doc flex-1 px-6 py-12 sm:px-10">
        <header className="max-w-2xl animate-rise">
          <p className="eyebrow mb-3">Explorer</p>
          <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-brand-deep sm:text-[2.6rem]">
            Par domaine d'usage
          </h1>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-body">
            Une même substance peut traverser plusieurs domaines — l'acide citrique
            est à la fois additif alimentaire, ingrédient cosmétique et agent ménager.
          </p>
        </header>

        {/* Aperçu des domaines */}
        <div className="mt-8 flex flex-wrap gap-2.5">
          {byDomain.map(({ domain, items }) => (
            <a
              key={domain}
              href={`#${domain}`}
              className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-4 py-2 text-[0.86rem] font-semibold text-brand-deep shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-sage hover:shadow-lift"
            >
              {domainLabel(domain)}
              <span className="rounded-pill bg-brand-cream px-2 py-0.5 text-[0.7rem] text-muted">
                {items.length}
              </span>
            </a>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-14">
          {byDomain.map(({ domain, items }) => (
            <section key={domain} id={domain} className="scroll-mt-24">
              <div className="mb-5 flex items-baseline justify-between border-b border-line pb-3">
                <h2 className="text-[1.4rem] font-bold text-ink">{domainLabel(domain)}</h2>
                <span className="text-[0.82rem] text-muted">
                  {items.length} entrée{items.length > 1 ? "s" : ""}
                </span>
              </div>
              <p className="mb-6 max-w-2xl text-[0.94rem] text-body">{DOMAIN_DESC[domain]}</p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((ingredient) => (
                  <IngredientCard key={ingredient.slug} ingredient={ingredient} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-card bg-brand-deep p-8 text-center sm:p-10">
          <p className="text-[1.3rem] font-bold text-white">Vous cherchez une substance précise ?</p>
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
