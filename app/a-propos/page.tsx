import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { HexField } from "@/components/Signature";
import { BookOpen, ShieldCheck, FlaskConical, Scale } from "@/components/icons";

export const metadata: Metadata = {
  title: "À propos",
  description: "La mission de Nutrivae : rendre lisible ce qui est invisible dans les produits du quotidien.",
};

const PRINCIPLES = [
  {
    icon: <BookOpen />,
    title: "Documenter, pas juger",
    text: "Aucun classement « bon » ou « mauvais ». Nous présentons des faits structurés et contextualisés, à vous d'en tirer vos conclusions.",
  },
  {
    icon: <ShieldCheck />,
    title: "Sans conflit d'intérêt",
    text: "Pas de marque à vendre, pas de discours militant. La donnée est rattachée à ses sources publiques et vérifiables.",
  },
  {
    icon: <FlaskConical />,
    title: "Pédagogique d'abord",
    text: "Une description en langage simple, puis le détail scientifique pour qui veut creuser. La précision sans le jargon inutile.",
  },
  {
    icon: <Scale />,
    title: "Mentions essentielles en premier",
    text: "Statut réglementaire, compatibilité, contre-indications et controverses sont mis en avant, pas enfouis.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader active="/a-propos" />
      <main className="flex-1">
        {/* Manifeste */}
        <section className="relative overflow-hidden border-b border-line">
          <HexField className="pointer-events-none absolute right-0 top-0 h-96 w-[40rem] text-brand-deep/[0.04]" />
          <div className="relative mx-auto max-w-doc px-6 py-16 sm:px-10 sm:py-24">
            <p className="eyebrow mb-4 animate-rise">Notre mission</p>
            <h1 className="max-w-3xl animate-rise text-[2.2rem] font-bold leading-[1.1] tracking-tight text-brand-deep sm:text-[3.2rem]">
              Rendre lisible ce qui est invisible dans les produits du quotidien.
            </h1>
            <p className="mt-6 max-w-2xl text-[1.1rem] leading-relaxed text-body">
              Additifs alimentaires, ingrédients cosmétiques, substances ménagères et
              pharmaceutiques : ces noms et ces codes nous entourent sans que l'on sache
              ce qu'ils recouvrent. Nutrivae les traduit en connaissance claire,
              accessible et sourcée.
            </p>
          </div>
        </section>

        {/* Principes */}
        <section className="mx-auto max-w-doc px-6 py-16 sm:px-10">
          <h2 className="text-[1.6rem] font-bold text-ink">Nos principes</h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="card flex gap-4 p-6">
                <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-ok-soft text-[#0a7c54]">
                  {p.icon}
                </span>
                <div>
                  <h3 className="font-bold text-ink">{p.title}</h3>
                  <p className="mt-1.5 text-[0.92rem] leading-relaxed text-body">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Avertissement */}
        <section className="mx-auto max-w-doc px-6 pb-16 sm:px-10">
          <div className="rounded-card border border-line bg-brand-cream p-6 sm:p-8">
            <h2 className="text-[1.1rem] font-bold text-ink">Une précision importante</h2>
            <p className="mt-3 max-w-3xl text-[0.95rem] leading-relaxed text-body">
              Nutrivae a une visée documentaire et éducative. Les informations
              présentées ne constituent ni un avis médical, ni une recommandation de
              consommation. En cas de doute sur une substance, un allergène ou une
              contre-indication, consultez un professionnel de santé. Les données de
              cette V1 sont indicatives et appelées à s'enrichir.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-doc px-6 pb-20 sm:px-10">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[1.2rem] font-bold text-brand-deep">
              Explorez la base, une substance à la fois.
            </p>
            <Link
              href="/ingredients"
              className="inline-flex rounded-pill bg-brand-deep px-6 py-3 text-[0.9rem] font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Voir les ingrédients
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
