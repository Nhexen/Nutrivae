"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { searchItems, type SearchItem } from "@/lib/search";
import { Search } from "./icons";
import { RegulatoryBadge } from "./StatusBadges";

interface SearchFieldProps {
  // Suggestions affichées à vide + index complet pour la recherche live.
  suggestions: SearchItem[];
  index: SearchItem[];
}

export function SearchField({ suggestions, index }: SearchFieldProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => (query.trim() ? searchItems(index, query) : []), [index, query]);
  const isSearching = query.trim().length > 0;
  const showDropdown = focused && isSearching;

  function goTo(slug: string) {
    router.push(`/ingredient/${slug}`);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isSearching) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      const target = results[active] ?? results[0];
      if (target) goTo(target.slug);
    } else if (event.key === "Escape") {
      setQuery("");
      setActive(0);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Barre de recherche arrondie */}
      <div className="relative">
        <div
          className={`flex items-center gap-3 rounded-pill border bg-surface px-5 py-4 transition-shadow duration-200 ${
            focused ? "border-ok shadow-lift" : "border-line shadow-card"
          }`}
        >
          <Search className="h-5 w-5 flex-none text-brand-slate" />
          <input
            id="nv-search"
            ref={inputRef}
            type="search"
            autoComplete="off"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onKeyDown={onKeyDown}
            placeholder="Rechercher un ingrédient, un code (E-number)…"
            className="w-full bg-transparent text-[1.05rem] text-ink placeholder:text-faint focus:outline-none"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls="nv-results"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Effacer"
              className="grid h-7 w-7 flex-none place-items-center rounded-full text-muted transition-colors hover:bg-brand-cream hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>

        {/* Résultats en survol */}
        {showDropdown && (
          <div
            id="nv-results"
            className="card absolute left-0 right-0 top-[calc(100%+0.6rem)] z-20 overflow-hidden p-1.5 text-left"
          >
            {results.length === 0 ? (
              <p className="px-4 py-6 text-center text-[0.92rem] text-muted">
                Aucune entrée ne correspond à « {query} ».
              </p>
            ) : (
              <ul className="max-h-[22rem] overflow-auto">
                {results.map((item, index) => (
                  <li key={item.slug}>
                    <Link
                      href={`/ingredient/${item.slug}`}
                      onMouseEnter={() => setActive(index)}
                      className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 transition-colors ${
                        index === active ? "bg-brand-cream" : "hover:bg-brand-cream/60"
                      }`}
                    >
                      <span className="flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className="font-bold text-ink">{item.name}</span>
                          <span className="text-[0.78rem] font-semibold text-ok">
                            {item.aliases[0]}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[0.8rem] text-muted">{item.family}</span>
                      </span>
                      <RegulatoryBadge status={item.regulatoryStatus} size="sm" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Suggestions populaires (pills) */}
      {!isSearching && (
        <div className="mt-7 text-center">
          <p className="eyebrow mb-3">Suggestions populaires</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {suggestions.map((item) => (
              <Link
                key={item.slug}
                href={`/ingredient/${item.slug}`}
                className="rounded-pill border border-line bg-surface px-4 py-2 text-[0.88rem] font-semibold text-brand-deep shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-sage hover:shadow-lift"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
