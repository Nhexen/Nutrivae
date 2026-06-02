import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SearchField } from "@/components/SearchField";
import { SiteFooter } from "@/components/SiteHeader";
import { HexField } from "@/components/Signature";
import { BookOpen, ShieldCheck, FlaskConical, Scale } from "@/components/icons";
import { getAllIngredients } from "@/lib/ingredients";
import { toSearchItem } from "@/lib/search";

const PILLARS = [
  { icon: <BookOpen />, title: "Information fiable", text: "Sourcée et à jour" },
  { icon: <ShieldCheck />, title: "Transparence", text: "Sans conflit d'intérêt" },
  { icon: <FlaskConical />, title: "Compréhension", text: "Clair et pédagogique" },
  { icon: <Scale />, title: "Réglementation", text: "Globale et détaillée" },
];

export default async function HomePage() {
  const all = await getAllIngredients();
  const index = all.map(toSearchItem);
  const suggestions = ["acide-citrique-e330", "aspartame", "glycerine", "sodium-lauryl-sulfate", "lecithine"]
    .map((slug) => index.find((i) => i.slug === slug))
    .filter((i): i is NonNullable<typeof i> => Boolean(i));

  return (
    <div className="flex min-h-screen flex-col">
      {/* En-tête */}
      <header className="mx-auto flex w-full max-w-doc items-center justify-between px-6 py-5 sm:px-10">
        <Logo />
        <nav className="hidden items-center gap-7 text-[0.92rem] font-medium text-body sm:flex">
          <Link className="transition-colors hover:text-brand-deep" href="/ingredients">Ingrédients</Link>
          <Link className="transition-colors hover:text-brand-deep" href="/categories">Catégories</Link>
          <Link className="transition-colors hover:text-brand-deep" href="/a-propos">À propos</Link>
          <Link className="transition-colors hover:text-brand-deep" href="/ressources">Ressources</Link>
        </nav>
      </header>

      {/* Bloc recherche */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-8 sm:pt-4">
        <HexField className="pointer-events-none absolute left-1/2 top-0 h-[26rem] w-[44rem] -translate-x-1/2 text-brand-deep/[0.035] [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent)]" />
        <div className="relative w-full max-w-2xl animate-rise text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-pill bg-ok-soft px-3.5 py-1.5 text-[0.78rem] font-semibold text-[#0a7c54]">
            <span className="h-1.5 w-1.5 rounded-full bg-ok" /> La connaissance, en toute transparence
          </span>
          <h1 className="text-balance text-[2.1rem] font-bold leading-[1.1] tracking-tight text-brand-deep sm:text-[2.9rem]">
            Comprendre ce que vous consommez.
            <br />
            <span className="text-ok">En toute confiance.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-[1.02rem] leading-relaxed text-body">
            Recherchez un ingrédient alimentaire ou cosmétique et accédez à une
            information fiable, claire et sourcée.
          </p>

          <div className="mt-9">
            <SearchField suggestions={suggestions} index={index} />
          </div>
        </div>
      </main>

      {/* Piliers */}
      <section className="mx-auto w-full max-w-doc px-6 pb-12 sm:px-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="card flex flex-col gap-2 p-5">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ok-soft text-[#0a7c54]">
                {p.icon}
              </span>
              <span className="mt-1 font-bold text-ink">{p.title}</span>
              <span className="text-[0.82rem] text-muted">{p.text}</span>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
