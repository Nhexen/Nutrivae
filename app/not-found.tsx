import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteHeader";
import { Search } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto w-full max-w-doc px-6 py-5 sm:px-10">
        <Logo />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="eyebrow mb-5">Erreur 404</p>
        <h1 className="max-w-xl text-[1.9rem] font-bold leading-tight tracking-tight text-brand-deep sm:text-[2.4rem]">
          Cette entrée n'existe pas encore.
        </h1>
        <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-body">
          La connaissance de Nutrivae s'étend progressivement. La substance que vous
          cherchez n'a peut-être pas encore été documentée.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex items-center gap-2 rounded-pill bg-brand-deep px-5 py-3 text-[0.9rem] font-semibold text-white transition-colors hover:bg-ok"
        >
          <Search className="h-4 w-4" /> Revenir à la recherche
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
