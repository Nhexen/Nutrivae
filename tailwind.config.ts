import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palette de marque Nutrivae (DA officielle).
        brand: {
          deep: "#0F3D2E", // vert profond — titres, logo, boutons
          sage: "#A8C5B2", // vert sauge — surfaces douces
          slate: "#6B7C93", // bleu-gris — texte secondaire
          cream: "#FAFAF7", // blanc cassé — fond
        },
        // Couleurs sémantiques (statuts factuels, jamais un jugement de valeur).
        ok: { DEFAULT: "#10B981", strong: "#22C55E", soft: "#E7F7EF" },
        warn: { DEFAULT: "#F59E0B", soft: "#FEF3E2" },
        danger: { DEFAULT: "#EF4444", soft: "#FCEBEB" },
        info: { DEFAULT: "#3B82F6", soft: "#E8F0FE" },
        // Neutres dérivés du vert profond pour un gris « chaud ».
        ink: "#15241D",
        body: "#3F4D46",
        muted: "#7C887F",
        faint: "#A9B2AB",
        line: "#E7EAE5",
        surface: "#FFFFFF",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "1.25rem",
        pill: "999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 61, 46, 0.04), 0 8px 24px -12px rgba(15, 61, 46, 0.12)",
        lift: "0 2px 4px rgba(15, 61, 46, 0.05), 0 18px 40px -16px rgba(15, 61, 46, 0.18)",
      },
      letterSpacing: {
        label: "0.08em",
      },
      maxWidth: {
        doc: "76rem",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        reveal: {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        reveal: "reveal 0.28s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
