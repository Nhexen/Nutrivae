"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { matchText, type ScanEntry, type ScanMatch } from "@/lib/scan";
import { RegulatoryBadge, ControversyBadge } from "./StatusBadges";

const SAMPLE =
  "Ingrédients : eau, sucre, sirop de glucose-fructose, acide citrique (E330), arôme, " +
  "colorant E102, conservateur : benzoate de sodium (E211), édulcorant : aspartame, " +
  "antioxydant E300, sel.";

type Phase = "idle" | "ocr" | "ready";

export function ScanClient({ index }: { index: ScanEntry[] }) {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzed, setAnalyzed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => (analyzed ? matchText(index, text) : []), [analyzed, index, text]);
  const flagged = matches.filter(
    (m) => m.entry.regulatoryStatus !== "autorise" || m.entry.controversy !== "aucune",
  );

  async function runOcr(file: File) {
    setError(null);
    setPhase("ocr");
    setProgress(0);
    setPreview(URL.createObjectURL(file));
    try {
      const Tesseract = (await import("tesseract.js")).default;
      const { data } = await Tesseract.recognize(file, "fra+eng", {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100));
        },
      });
      setText(data.text.trim());
      setPhase("ready");
      setAnalyzed(true);
    } catch {
      setError("La reconnaissance a échoué. Vous pouvez coller le texte manuellement ci-dessous.");
      setPhase("idle");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Entrée : photo + texte */}
      <div className="flex flex-col gap-5">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) runOcr(f);
          }}
        />

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="card flex flex-col items-center justify-center gap-3 border-dashed p-10 text-center transition-colors hover:border-brand-sage hover:bg-brand-cream/60"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-ok-soft text-[#0a7c54]">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 8.5 4.5 6h5L11 8M3 8.5V18a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8.5a1 1 0 0 0-1-1h-5.5" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
          </span>
          <span className="font-bold text-ink">Photographier ou importer une étiquette</span>
          <span className="max-w-xs text-[0.85rem] text-muted">
            La reconnaissance de texte s&apos;exécute dans votre navigateur — aucune image n&apos;est envoyée.
          </span>
        </button>

        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Aperçu de l'étiquette" className="max-h-52 w-full rounded-card object-contain ring-1 ring-line" />
        )}

        {phase === "ocr" && (
          <div className="rounded-2xl bg-brand-cream p-4">
            <div className="mb-2 flex items-center justify-between text-[0.82rem] font-semibold text-body">
              <span>Lecture de l&apos;étiquette…</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-ok transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {error && <p className="rounded-2xl bg-warn-soft px-4 py-3 text-[0.85rem] text-[#b9750a]">{error}</p>}

        <div>
          <label htmlFor="scan-text" className="eyebrow mb-2 block">
            Texte reconnu — modifiable
          </label>
          <textarea
            id="scan-text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setAnalyzed(false);
            }}
            rows={6}
            placeholder="Collez ou corrigez ici la liste d'ingrédients…"
            className="w-full resize-y rounded-card border border-line bg-surface p-4 text-[0.92rem] text-ink shadow-card focus:border-ok focus:outline-none"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAnalyzed(true)}
              disabled={text.trim().length < 2}
              className="rounded-pill bg-brand-deep px-5 py-2.5 text-[0.88rem] font-semibold text-white transition-colors hover:bg-ok disabled:opacity-40"
            >
              Analyser la liste
            </button>
            <button
              type="button"
              onClick={() => {
                setText(SAMPLE);
                setAnalyzed(true);
              }}
              className="rounded-pill border border-line bg-surface px-5 py-2.5 text-[0.88rem] font-semibold text-body transition-colors hover:border-brand-sage"
            >
              Essayer un exemple
            </button>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div>
        {!analyzed ? (
          <div className="card grid h-full min-h-52 place-items-center p-8 text-center text-[0.92rem] text-muted">
            Les substances reconnues apparaîtront ici, avec leur statut.
          </div>
        ) : matches.length === 0 ? (
          <div className="card grid h-full min-h-52 place-items-center p-8 text-center text-[0.92rem] text-muted">
            Aucune substance connue détectée dans ce texte.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="card flex flex-wrap items-center gap-x-6 gap-y-2 p-5">
              <span className="text-[2rem] font-bold leading-none text-brand-deep">{matches.length}</span>
              <span className="text-[0.9rem] text-body">
                substance{matches.length > 1 ? "s" : ""} reconnue{matches.length > 1 ? "s" : ""}
                {flagged.length > 0 && (
                  <>
                    {" "}— dont{" "}
                    <span className="font-bold text-[#c23434]">{flagged.length} à examiner</span>
                  </>
                )}
              </span>
            </div>

            <ul className="flex flex-col gap-2.5">
              {matches.map((m) => (
                <ScanRow key={m.entry.slug} match={m} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function ScanRow({ match }: { match: ScanMatch }) {
  const { entry } = match;
  const risk = entry.regulatoryStatus === "interdit" ? "danger" : entry.regulatoryStatus === "restreint" || entry.controversy !== "aucune" ? "warn" : null;
  const accent = risk === "danger" ? "border-l-4 border-danger" : risk === "warn" ? "border-l-4 border-warn" : "border-l-4 border-transparent";

  return (
    <li>
      <Link
        href={`/ingredient/${entry.slug}`}
        className={`card flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift ${accent}`}
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-bold text-ink">{entry.name}</span>
            <span className="text-[0.78rem] font-semibold text-ok">{entry.code}</span>
          </span>
          <span className="mt-0.5 block text-[0.78rem] text-muted">
            {entry.family} · détecté : « {match.via} »
          </span>
        </span>
        <span className="flex flex-none flex-col items-end gap-1">
          <RegulatoryBadge status={entry.regulatoryStatus} size="sm" />
          {entry.controversy !== "aucune" && <ControversyBadge level={entry.controversy} size="sm" />}
        </span>
      </Link>
    </li>
  );
}
