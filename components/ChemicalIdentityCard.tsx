import type { PubChemData } from "@/lib/external";
import { HexField, MoleculeFrame } from "./Signature";

// Met les chiffres d'une formule brute en indice (C6H8O7 → C₆H₈O₇).
function Formula({ value }: { value: string }) {
  const parts = value.split(/(\d+)/);
  return (
    <span className="font-mono">
      {parts.map((p, i) =>
        /^\d+$/.test(p) ? (
          <sub key={i} className="text-[0.7em]">
            {p}
          </sub>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 border-b border-line py-2.5 last:border-0">
      <dt className="text-[0.72rem] font-semibold uppercase tracking-label text-muted">{label}</dt>
      <dd className="text-[0.92rem] font-medium text-ink">{children}</dd>
    </div>
  );
}

export function ChemicalIdentityCard({
  name,
  pubchem,
}: {
  name: string;
  pubchem?: PubChemData;
}) {
  return (
    <section className="card relative scroll-mt-24 overflow-hidden p-6">
      {/* Motif signature en fond */}
      <HexField className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 text-brand-deep/[0.05]" />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ok-soft text-[#0a7c54]">
            {/* atome */}
            <svg viewBox="0 0 24 24" className="h-[1.05em] w-[1.05em]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
              <ellipse cx="12" cy="12" rx="10" ry="4.3" />
              <ellipse cx="12" cy="12" rx="10" ry="4.3" transform="rotate(60 12 12)" />
              <ellipse cx="12" cy="12" rx="10" ry="4.3" transform="rotate(120 12 12)" />
            </svg>
          </span>
          <h2 className="text-[1.15rem] font-bold text-ink">Carte d'identité chimique</h2>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-1 items-center gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">
        {/* Structure réelle dans un cadre hexagonal */}
        <div className="mx-auto sm:mx-0">
          <MoleculeFrame src={pubchem?.image2d} alt={`Structure moléculaire — ${name}`} />
          <p className="mt-2 text-center text-[0.66rem] font-medium uppercase tracking-label text-faint">
            {pubchem ? "Structure 2D" : "Mélange complexe"}
          </p>
        </div>

        {/* Données */}
        <div>
          {pubchem ? (
            <dl>
              {pubchem.formula && (
                <Row label="Formule">
                  <Formula value={pubchem.formula} />
                </Row>
              )}
              {pubchem.weight && (
                <Row label="Masse molaire">
                  {pubchem.weight} <span className="text-muted">g/mol</span>
                </Row>
              )}
              {pubchem.iupac && (
                <Row label="Nom IUPAC">
                  <span className="leading-snug">{pubchem.iupac}</span>
                </Row>
              )}
              {pubchem.smiles && (
                <Row label="SMILES">
                  <code className="break-all font-mono text-[0.78rem] text-brand-slate">
                    {pubchem.smiles}
                  </code>
                </Row>
              )}
              <Row label="PubChem CID">
                <a
                  href={pubchem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ok underline decoration-ok/30 underline-offset-2 hover:decoration-ok"
                >
                  {pubchem.cid} ↗
                </a>
              </Row>
            </dl>
          ) : (
            <p className="text-[0.92rem] leading-relaxed text-muted">
              Cette substance est un mélange de plusieurs composés : elle ne possède pas
              de structure ni de formule brute uniques.
            </p>
          )}
        </div>
      </div>

      {/* Provenance */}
      <p className="relative mt-5 inline-flex items-center gap-1.5 rounded-pill bg-brand-cream px-3 py-1 text-[0.68rem] font-semibold text-brand-slate ring-1 ring-inset ring-line">
        <span className="h-1.5 w-1.5 rounded-full bg-ok" />
        Données vérifiées en direct · PubChem (NCBI)
      </p>
    </section>
  );
}
