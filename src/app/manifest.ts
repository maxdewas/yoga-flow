import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Flow Creator",
    short_name: "Flow",
    description: "Préparer ses cours de yoga : postures, séquences, analyse et lecture guidée.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f0e8",
    theme_color: "#46684f",
    lang: "fr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
