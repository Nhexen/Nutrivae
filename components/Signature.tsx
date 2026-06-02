import type { PhysicalForm } from "@/data/types";
import { LogoMark } from "./Logo";

// Motif « nid d'abeille » très discret, dérivé de l'hexagone du logo.
export function HexField({ className = "" }: { className?: string }) {
  return (
    <svg className={className} aria-hidden width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="nv-hex" width="56" height="48.5" patternUnits="userSpaceOnUse">
          <path
            d="M14 0.5 28 8.6v16.2L14 32.9 0 24.8V8.6L14 0.5Z M42 24.3 56 32.4v16.2L42 56.7 28 48.6V32.4L42 24.3Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#nv-hex)" />
    </svg>
  );
}

const HEX_CLIP = "polygon(50% 1%, 93% 25%, 93% 75%, 50% 99%, 7% 75%, 7% 25%)";

// Cadre hexagonal réutilisable (écho du logo). Le contenu est centré dans la
// zone sûre de l'hexagone pour ne jamais déborder.
export function HexFrame({
  size = 132,
  children,
  inset = "18%",
}: {
  size?: number;
  children: React.ReactNode;
  inset?: string;
}) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 bg-gradient-to-br from-brand-sage/40 to-ok-soft"
        style={{ clipPath: HEX_CLIP }}
      />
      <div
        className="absolute inset-[6px] overflow-hidden bg-surface"
        style={{ clipPath: HEX_CLIP }}
      >
        <div className="grid h-full w-full place-items-center" style={{ padding: inset }}>
          {children}
        </div>
      </div>
      <svg className="absolute inset-0" viewBox="0 0 100 100" fill="none" aria-hidden>
        <polygon
          points="50,1 93,25 93,75 50,99 7,75 7,25"
          stroke="currentColor"
          strokeWidth="1.2"
          className="text-brand-deep/15"
        />
      </svg>
    </div>
  );
}

// Structure moléculaire réelle (PubChem) — intégration corrigée : l'image est
// confinée à la zone centrale de l'hexagone via un fort inset.
export function MoleculeFrame({ src, alt, size = 132 }: { src?: string; alt: string; size?: number }) {
  return (
    <HexFrame size={size} inset="22%">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full object-contain mix-blend-multiply"
          loading="lazy"
        />
      ) : (
        <LogoMark className="h-3/5 w-3/5 text-brand-deep/60" />
      )}
    </HexFrame>
  );
}

// ── Représentation illustrée par état physique ──
function FormIcon({ form, className = "h-full w-full" }: { form: PhysicalForm; className?: string }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (form) {
    case "liquide":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden>
          <path {...stroke} d="M24 7c6 8 10 13 10 19a10 10 0 0 1-20 0c0-6 4-11 10-19Z" />
          <path {...stroke} strokeWidth={1.3} className="opacity-60" d="M19 27a5 5 0 0 0 5 5" />
        </svg>
      );
    case "cristaux":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden>
          <path {...stroke} d="M22 6l7 5-3 9h-8l-3-9 7-5Z" />
          <path {...stroke} className="opacity-70" d="M30 20l8 4-2 8-7-2 1-10Z" />
          <path {...stroke} className="opacity-70" d="M18 20l-8 4 2 8 7-2-1-10Z" />
        </svg>
      );
    case "poudre":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden>
          <path {...stroke} d="M9 36c3-9 7-13 15-13s12 4 15 13" />
          <path {...stroke} d="M7 36h34" />
          <circle cx="20" cy="16" r="1.3" className="opacity-70" fill="currentColor" stroke="none" />
          <circle cx="27" cy="12" r="1.3" className="opacity-70" fill="currentColor" stroke="none" />
          <circle cx="31" cy="18" r="1.3" className="opacity-70" fill="currentColor" stroke="none" />
        </svg>
      );
    case "pate":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden>
          <path {...stroke} d="M10 32c0-5 5-8 10-8 3 0 4-2 4-4 0-3 3-5 6-4 5 2 8 6 8 11 0 4-3 7-8 7H16c-4 0-6-3-6-5Z" />
          <path {...stroke} d="M8 37h32" />
        </svg>
      );
    case "gaz":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden>
          <circle cx="17" cy="18" r="3.2" {...stroke} />
          <circle cx="29" cy="14" r="2.4" {...stroke} className="opacity-70" />
          <circle cx="27" cy="26" r="4" {...stroke} />
          <path {...stroke} className="opacity-60" d="M20 34c2 3 6 3 8 0M14 30c1 2 3 2 4 0" />
        </svg>
      );
    default: // solide
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden>
          <path {...stroke} d="M24 7l13 7v14l-13 7-13-7V14l13-7Z" />
          <path {...stroke} className="opacity-60" d="M24 21l13-7M24 21v15M24 21 11 14" />
        </svg>
      );
  }
}

// Visuel principal du hero : l'état physique illustré dans l'hexagone signature.
export function SubstanceFrame({ form, label, size = 140 }: { form: PhysicalForm; label?: string; size?: number }) {
  return (
    <div className="flex flex-col items-center">
      <HexFrame size={size} inset="26%">
        <FormIcon form={form} className="h-full w-full text-brand-deep/80" />
      </HexFrame>
      {label && (
        <p className="mt-2 max-w-[10rem] text-center text-[0.66rem] font-semibold uppercase tracking-label text-faint">
          {label}
        </p>
      )}
    </div>
  );
}
