import Link from "next/link";

// Marque Nutrivae : hexagone + pousse, inspiré de la DA.
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Hexagone */}
      <path
        d="M24 3.5 41.8 13.75v20.5L24 44.5 6.2 34.25v-20.5L24 3.5Z"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Petit hexagone-gemme en haut */}
      <path
        d="M24 11.5 28 13.8v4.6L24 20.7l-4-2.3v-4.6L24 11.5Z"
        fill="currentColor"
        opacity="0.55"
      />
      {/* Tige */}
      <path d="M24 35.5V23.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      {/* Feuille gauche */}
      <path
        d="M24 28.5c-2.6 0-6.8-1-8.2-5.4 4.5-1 7.6 1.2 8.2 5.4Z"
        fill="currentColor"
      />
      {/* Feuille droite */}
      <path
        d="M24 26.2c2.6 0 6.8-1 8.2-5.4-4.5-1-7.6 1.2-8.2 5.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 text-brand-deep" aria-label="Nutrivae — accueil">
      <LogoMark className={small ? "h-6 w-6" : "h-8 w-8"} />
      <span className={`font-bold tracking-tight ${small ? "text-lg" : "text-xl"}`}>Nutrivae</span>
    </Link>
  );
}
