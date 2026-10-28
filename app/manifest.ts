import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OCTOM One",
    short_name: "OCTOM One",
    description: "Know who to contact today.",
    // The id keeps the identity of apps installed before the start page changed.
    id: "/dashboard",
    start_url: "/today",
    scope: "/",
    lang: "en",
    categories: ["business", "productivity"],
    shortcuts: [
      { name: "Today", url: "/today", icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }] },
      { name: "Pipeline", url: "/pipeline", icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }] },
      { name: "Weekly review", url: "/review", icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }] },
    ],
    display: "standalone",
    background_color: "#0B1026",
    theme_color: "#0B1026",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
