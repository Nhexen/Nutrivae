import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Évite l'inférence d'une racine de workspace erronée (lockfiles multiples).
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
