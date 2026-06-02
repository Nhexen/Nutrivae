import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Police unique de la marque : Plus Jakarta Sans.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Nutrivae — Comprendre ce que vous consommez, en toute confiance",
    template: "%s · Nutrivae",
  },
  description:
    "La connaissance, en toute transparence. Base de connaissance ouverte sur les ingrédients de l'alimentation, des cosmétiques, des produits ménagers et pharmaceutiques.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={jakarta.variable}>
      <body className="min-h-screen bg-brand-cream font-sans text-body antialiased">
        {children}
      </body>
    </html>
  );
}
