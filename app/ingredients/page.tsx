import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { IngredientCard } from "@/components/IngredientCard";
import { getAllIngredients } from "@/lib/ingredients";

export const metadata: Metadata = {
  title: "Ingrédients",
  description: "Toutes les substances documentées dans la base Nutrivae.",
};

export default async function IngredientsPage() {
  const all = await getAllIngredients();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader active="/ingredients" />
      <main className="mx-auto w-full max-w-doc flex-1 px-6 py-12 sm:px-10">
        <header className="max-w-2xl animate-rise">
          <p className="eyebrow mb-3">L'annuaire</p>
          <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-brand-deep sm:text-[2.6rem]">
            Toutes les entrées
          </h1>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-body">
            {all.length} substances documentées à ce jour, de l'alimentaire au
            cosmétique. Chaque fiche présente d'abord ses mentions essentielles.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((ingredient) => (
            <IngredientCard key={ingredient.slug} ingredient={ingredient} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
