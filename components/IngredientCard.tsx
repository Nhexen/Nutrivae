import Link from "next/link";
import type { Ingredient } from "@/data/types";
import { SubstanceFrame } from "./Signature";
import { RegulatoryBadge, ControversyBadge } from "./StatusBadges";

export function IngredientCard({ ingredient }: { ingredient: Ingredient }) {
  return (
    <Link
      href={`/ingredient/${ingredient.slug}`}
      className="card group flex flex-col gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="truncate text-[1.12rem] font-bold text-ink">{ingredient.name}</h3>
            <span className="flex-none text-[0.78rem] font-bold text-ok">{ingredient.aliases[0]}</span>
          </div>
          <p className="mt-0.5 text-[0.82rem] text-muted">{ingredient.family}</p>
        </div>
        <div className="flex-none transition-transform duration-300 group-hover:scale-105">
          <SubstanceFrame form={ingredient.form} size={56} />
        </div>
      </div>

      <p className="line-clamp-2 text-[0.88rem] leading-relaxed text-body">{ingredient.plain}</p>

      <div className="mt-auto flex flex-wrap gap-1.5">
        <RegulatoryBadge status={ingredient.regulatoryStatus} size="sm" />
        <ControversyBadge level={ingredient.controversy} size="sm" />
      </div>
    </Link>
  );
}
