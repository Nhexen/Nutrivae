import Link from "next/link";
import { Logo } from "./Logo";

const NAV = [
  ["/liste", "Additifs E"],
  ["/ingredients", "Ingrédients"],
  ["/categories", "Catégories"],
  ["/a-propos", "À propos"],
  ["/ressources", "Ressources"],
] as const;

export function SiteHeader({ active }: { active?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-brand-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-doc items-center justify-between px-6 py-4 sm:px-10">
        <Logo small />
        <nav className="flex items-center gap-5 text-[0.9rem] font-medium text-body sm:gap-7">
          {NAV.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`hidden transition-colors hover:text-brand-deep sm:block ${
                active === href ? "text-brand-deep" : ""
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/"
            className="rounded-pill bg-brand-deep px-4 py-2 text-[0.82rem] font-semibold text-white transition-colors hover:bg-ok"
          >
            Rechercher
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-doc">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Logo small />
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[0.84rem] text-muted">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className="transition-colors hover:text-brand-deep">
                {label}
              </Link>
            ))}
          </nav>
          <p className="text-[0.76rem] text-faint">La connaissance, en toute transparence.</p>
        </div>
        <p className="mt-6 max-w-3xl border-t border-line pt-5 text-[0.76rem] leading-relaxed text-faint">
          Nutrivae documente sans classer « bon » ou « mauvais ». Information à visée
          documentaire et éducative, sans conseil médical ni jugement de valeur. Les
          données réglementaires de cette V1 sont indicatives.
        </p>
      </div>
    </footer>
  );
}
