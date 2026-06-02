import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { ScanClient } from "@/components/ScanClient";
import { HexField } from "@/components/Signature";
import { getAllIngredients } from "@/lib/ingredients";
import { toScanEntry } from "@/lib/scan";

export const metadata: Metadata = {
  title: "Scanner une étiquette",
  description: "Photographiez une liste d'ingrédients : Nutrivae reconnaît les substances connues et affiche leur statut. Reconnaissance de texte 100 % dans le navigateur.",
};

export default async function ScanPage() {
  const all = await getAllIngredients();
  const index = all.map(toScanEntry);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader active="/scan" />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-line">
          <HexField className="pointer-events-none absolute right-0 top-0 h-72 w-[36rem] text-brand-deep/[0.04]" />
          <div className="relative mx-auto max-w-doc px-6 py-12 sm:px-10">
            <span className="mb-4 inline-flex items-center gap-2 rounded-pill bg-ok-soft px-3 py-1 text-[0.74rem] font-semibold text-[#0a7c54]">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Prototype · future application
            </span>
            <h1 className="max-w-2xl text-[2rem] font-bold leading-tight tracking-tight text-brand-deep sm:text-[2.7rem]">
              Scanner une liste d&apos;ingrédients
            </h1>
            <p className="mt-3 max-w-2xl text-[1.02rem] leading-relaxed text-body">
              Photographiez l&apos;étiquette d&apos;un produit : la reconnaissance de texte
              s&apos;exécute dans votre navigateur, puis Nutrivae identifie les substances
              connues parmi les {all.length} référencées et signale celles à examiner.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-doc px-6 py-10 sm:px-10">
          <ScanClient index={index} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
